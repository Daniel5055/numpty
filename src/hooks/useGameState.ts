import { useCallback, useEffect, useRef, useState } from "react";
import {  blankCard,  removeCard, removeLast, type CardValue, type ICard } from "../utils/card";
import { type MatchState, type GameState } from "../utils/game";
import type { Engine } from "../utils/engines/engine";
import { boardAdd, boardRemove, boardUnique, boardUnresolved } from "../utils/board";
import _ from "lodash";
import ContextManager from "../utils/contextManager";

function useGameState(player: string ,engine: Engine): GameState {
    const nextId = useRef(0)

    const [attacking, setAttacking] = useState<boolean>(true)

    const [toGrant, setToGrant] = useState<ICard[]>([])

    const cmRef = useRef<ContextManager>(new ContextManager())

    const [hand, setHand] = useState<ICard[]>([])
    const [deck, setDeck] = useState<ICard | undefined>(undefined)
    const [discard, setDiscard] = useState<ICard[]>([])
    const [opHand, setOpHand] = useState<ICard[]>([])
    const [board, setBoard] = useState<[ICard, ICard?][]>([])

    const [matchState, setMatchState] = useState<MatchState>("Wait")

    const [attackOptions, setAttackOptions] = useState<Set<CardValue>>(new Set())

    function drawCards(cm: ContextManager, cards: ICard[], opDrawn: number, first: boolean) {
        let left = opDrawn

        // Drawing a blank card
        const drawBlank = (_cm: ContextManager) => {
            const blank = blankCard(nextId.current++)
            return _cm
                .then(() => setDeck(blank))
                .wait()
                .then(() => {
                    setDeck(undefined)
                    setOpHand((h) => h.concat(blank))
                })
                .wait()
        } 

        // Draw op card if not first
        if (!first && left > 0) {
            left--;
            cm.queue(drawBlank)
        }

        // Draw cards until and alternate with op if possible
        for (let i = 0; i < cards.length; i++) {
            cm
                .then(() => setDeck(cards[i]))
                .wait()
                .then(() => {
                    setDeck(undefined)
                    setHand((h) => h.concat(cards[i]))
                })
                .wait()

            if (left > 0) {
                left--
                cm.queue(drawBlank)
            }
        }

        while (left > 0) {
            left--
            cm.queue(drawBlank)
        }
        
        return cm
    }

    function playCard(cm: ContextManager, card1: ICard, card2?: ICard) {
        return cm
            .then(() => setOpHand((h) => removeLast(h).concat(card1)))
            .wait()
            .then(() => {
                setOpHand((h) => removeLast(h))
                setBoard((b) => boardAdd(b, card1, card2))
            })
            .wait()
    }

    function opTakeBoard(cm: ContextManager, except?: ICard) {
        const cards = _.reverse(_.zip.apply(_, board)).flat().filter((c) => c !== undefined && c !== except) as ICard[]

        return cm
            .then(() => {
                setOpHand((h) => h.concat(cards))
                setBoard((b) => cards.reduce((b1, card) => boardRemove(card, b1), b))
            })
            .wait(400)
            .then(() => setOpHand((h) => removeLast(h, cards.length).concat(cards.map(() => blankCard(nextId.current++)))))
            .wait()
    }

    const finishBoard = useCallback((cm: ContextManager) => {
        const cards = _.reverse(_.zip.apply(_, board)).flat().filter((c) => c !== undefined) as ICard[]

        return cm
            .then(() => {
                setDiscard((d) => d.concat(cards))
                setBoard((b) => cards.reduce((b1, card) => boardRemove(card, b1), b))
            })
            .wait()
    }, [board])

    useEffect(() => {
        engine.attacked(player, (card) => {
            cmRef.current
                .then(() => setMatchState("Wait"))
                .queue((cm) => playCard(cm, card))
                .then(() => setMatchState("PendingDefence"))
        });
        engine.defended(player, (card, against) => {
            cmRef.current
                .then(() => setMatchState("Wait"))
                .queue((cm) => playCard(cm, card, against))
                .then(() => {
                    // Hacky way to access state within nested callback
                    setBoard((b) => {
                        setAttackOptions((ao) => new Set(ao).add(card.value))
                        if (boardUnresolved(b).length > 1) {
                            setMatchState("PendingExtraAttack")
                        } else {
                            setMatchState("PendingAttack")
                        }

                        return b
                    })
                })
        });
        engine.reversed(player, (card) => {
            cmRef.current.queue((cm) => playCard(cm, card))
            setAttacking(false)
            setMatchState("PendingDefence")
        });
        engine.drawn(player, (cards, opDrawn, first) => {
            cmRef.current.queue((cm) => drawCards(cm, cards, opDrawn, first))
            setMatchState(attacking ? "PendingAttack" : "PendingDefence")
        })
        engine.conceded(player, () => {
            console.log('ai conceeded')
            setMatchState("PendingGrant")
            setAttackOptions(new Set())
        })
        engine.finished(player, () => {
            setAttacking(true)
            cmRef.current.queue((cm) => finishBoard(cm))
            setMatchState("PendingAttack")
            setAttackOptions(new Set())
        })
        engine.granted(player, (cards) => {
            const bCards = board
                .flat()
                .filter((c) => c !== undefined)
            setHand((h) => h.concat(cards).concat(bCards))
            console.log('granted', cards)
            if (cards.length > 0) {
                setOpHand((h) => removeLast(h, cards.length))
            }
            setMatchState("Wait")
            setBoard([])
        })
        engine.start()
    }, [attacking, board, engine, finishBoard, player])

    function attack(card: ICard): boolean {
        if (!attacking) {
            console.warn("Defender cannot attack")
            return false
        }

        if (attackOptions.size > 0 && !attackOptions.has(card.value)) {
            console.warn("Attacker must attack with valid card value")
            console.warn('options:', attackOptions)
            return false
        }

        setAttackOptions((ao) => new Set(ao).add(card.value))
        setMatchState("Wait")
        setBoard((b) => boardAdd(b, card))
        setHand((h) => removeCard(h, card))

        engine.attack(player, card)

        return true
    }

    function defend(card: ICard, against: ICard): boolean {
        if (attacking) {
            console.warn("Attacker cannot defend")
            return false
        }

        // TODO Check if defence is valid, then

        // Check that card is on board
        const i = board.findIndex((([{suit, value},]) => suit == against.suit && value == against.value))
        if (i === -1 || board[i][1] !== undefined) {
            console.warn("Defend against complete stack")
            return false
        }

        engine.defend(player, card, against)
        setBoard((b) => boardAdd(b, card, against))
        setHand((h) => removeCard(h, card))

        if (boardUnresolved(board).length === 0) {
            setMatchState("Wait")
        } else {
            setMatchState("PendingDefence")
        }

        return true
    }

    function reverse(card: ICard): boolean {
        if (attacking) {
            console.warn("Attacker cannot reverse")
            return false
        }

        if (boardUnique(board).length > 1 || boardUnresolved(board).length !== board.length) {
            console.warn("Board state too advanced to reverse")
            return false
        }

        if (board[0][0].value !== card.value) {
            console.warn("Can only reverse same value cards")
            return false
        }

        engine.reverse(player, card)
        setBoard((b) => boardAdd(b, card))
        setHand((h) => removeCard(h, card))
        setMatchState("Wait")
        setAttacking(true)

        return true
    }

    function concede(): boolean {
        if (attacking) {
            console.warn("Attacker cannot concede")
            return false
        }

        setMatchState("Wait")
        setAttackOptions(new Set())

        engine.concede(player)


        return true
    }

    function finish(): boolean {
        if (!attacking) {
            console.warn("Defender cannot finish")
            return false
        }

        setAttacking(false)
        cmRef.current.queue((cm) => finishBoard(cm))
        setMatchState("Wait")

        engine.finish(player)

        return true
    }

    function grantEnd(card?: ICard): boolean {
        setToGrant([])
        if (!card) {
            setMatchState("PendingAttack")
        } else {
            cmRef.current.wait(400)
            setAttackOptions((ao) => new Set(ao).add(card.value))
            setMatchState("Wait")
            setBoard((b) => boardAdd(b, card))
            setHand((h) => removeCard(h, card))


        }

        cmRef.current
            .queue((cm) => opTakeBoard(cm, card)
            .then(() => {
                engine.grant(player, toGrant)
                if (card) {
                    engine.attack(player, card)
                }
            }))

        return true
    }

    function grant(card: ICard): boolean {
        setBoard((b) => boardAdd(b, card))
        setHand((h) => removeCard(h, card))
        setToGrant((g) => g.concat(card))

        return true
    }

    return {
        matchState,

        attacking,

        // Card states
        hand,
        opHand,
        board,
        deck,
        discard,

        // Interaction
        attack,
        defend,
        reverse,
        concede,
        finish,
        grant,
        grantEnd
    }
}

export default useGameState