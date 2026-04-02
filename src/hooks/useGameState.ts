import { useCallback, useEffect, useRef, useState } from "react";
import {  blankCard,  removeCard, removeLast, type CardSuit, type CardValue, type ICard } from "../utils/card";
import { type MatchState, type GameState } from "../utils/game";
import type { Engine, MkEngine } from "../utils/engines/engine";
import { boardAdd, boardRemove, boardUnique, boardUnresolved } from "../utils/board";
import _ from "lodash";
import ContextManager from "../utils/contextManager";
import SimpleAi from "../utils/ai/simpleAi";

function useGameState(id1: string, id2: string, trump: CardSuit, buildEngine: MkEngine): GameState {
    const nextId = useRef(0)

    // Context management handles animations and state changes in order
    const cmRef = useRef<ContextManager>(new ContextManager())
    const { current: engine } = useRef<Engine>(buildEngine(id1, id2, trump))

    // State controlling hands, board, deck and discards, including animations
    const [hand, setHand] = useState<ICard[]>([])
    const [deck, setDeck] = useState<ICard | undefined>(undefined)
    const [discard, setDiscard] = useState<ICard[]>([])
    const [opHand, setOpHand] = useState<ICard[]>([])
    const [board, setBoard] = useState<[ICard, ICard?][]>([])

    // User facing state
    const [matchState, setMatchState] = useState<MatchState>("Wait")
    const [attacking, setAttacking] = useState<boolean>(true)

    // Internal state
    const [attackOptions, setAttackOptions] = useState<Set<CardValue>>(new Set())
    const [toGrant, setToGrant] = useState<ICard[]>([])

    // Animations
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
        const cards = _.reverse(_.zip(...board)).flat().filter((c) => c !== undefined && c !== except) as ICard[]

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
        const cards = _.reverse(_.zip(...board)).flat().filter((c) => c !== undefined) as ICard[]

        return cm
            .then(() => {
                setDiscard((d) => d.concat(cards))
                setBoard((b) => cards.reduce((b1, card) => boardRemove(card, b1), b))
            })
            .wait()
    }, [board])

    // Assign engine handlers
    useEffect(() => {
        new SimpleAi(id2, engine)

        engine.attacked(id1, (card) => {
            cmRef.current
                .then(() => setMatchState("Wait"))
                .queue((cm) => playCard(cm, card))
                .then(() => setMatchState("PendingDefence"))
        });
        engine.defended(id1, (card, against) => {
            cmRef.current
                .then(() => setMatchState("Wait"))
                .queue((cm) => playCard(cm, card, against))
                .then(() => new Promise((res) => {
                    // Hacky way to access state within nested callback
                    setBoard((b) => {
                        setAttackOptions((ao) => new Set(ao).add(card.value))
                        if (boardUnresolved(b).length > 0) {
                            setMatchState("PendingExtraAttack")
                        } else {
                            setMatchState("PendingAttack")
                        }

                        // Necessary to prevent race conditions
                        res()

                        return b
                    })
                }))
        });
        engine.reversed(id1, (card) => {
            cmRef.current
                .queue((cm) => playCard(cm, card))
                .then(() => {
                    setAttacking(false)
                    setMatchState("PendingDefence")
                })
        });
        engine.drawn(id1, (cards, opDrawn, first) => {
            cmRef.current
                .queue((cm) => drawCards(cm, cards, opDrawn, first))
                // Must use setter access state from nested callabck
                .then(() => new Promise((res) => setAttacking((attacking) => {
                    setMatchState(attacking ? "PendingAttack" : "PendingDefence")

                    // Necesary to avoid race conditions
                    res()
                    return attacking
                })))
        })
        engine.conceded(id1, () => {
            cmRef.current.then(() => {
                console.log('ai conceeded')
                setMatchState("PendingGrant")
                setAttackOptions(new Set())
            })
        })
        engine.finished(id1, () => {
            cmRef.current
                .queue((cm) => finishBoard(cm))
                .then(() => {
                    setMatchState("PendingAttack")
                    setAttackOptions(new Set())
                    setAttacking(true)
                })
        })
        engine.granted(id1, (cards) => {
            const bCards = board
                .flat()
                .filter((c) => c !== undefined)
            setHand((h) => h.concat(cards).concat(bCards))
            if (cards.length > 0) {
                setOpHand((h) => removeLast(h, cards.length))
            }
            setMatchState("Wait")
            setBoard([])
        })
        engine.start()
    }, [attacking, board, engine, finishBoard, id1, id2])

    // Interaction

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

        engine.attack(id1, card)

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

        engine.defend(id1, card, against)
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

        engine.reverse(id1, card)
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

        engine.concede(id1)


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

        engine.finish(id1)

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
                engine.grant(id1, toGrant)
                if (card) {
                    engine.attack(id1, card)
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
        attacking,
        matchState,

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
