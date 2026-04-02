import { useEffect, useRef, useState } from "react";
import {  blankCard,  removeCard, removeLast, type CardValue, type ICard } from "../utils/card";
import { type MatchState, type GameState } from "../utils/game";
import type { Engine } from "../utils/engines/engine";
import { boardAdd, boardRemove } from "../utils/board";
import _ from "lodash";

function useGameState(player: string ,engine: Engine): GameState {
    const nextId = useRef(0)

    const [attacking, setAttacking] = useState<boolean>(true)

    const [toGrant, setToGrant] = useState<ICard[]>([])

    const aContext = useRef<Promise<void>>(Promise.resolve())

    const [hand, setHand] = useState<ICard[]>([])
    const [deck, setDeck] = useState<ICard | undefined>(undefined)
    const [discard, setDiscard] = useState<ICard[]>([])
    const [opHand, setOpHand] = useState<ICard[]>([])
    const [board, setBoard] = useState<[ICard, ICard?][]>([])

    const [matchState, setMatchState] = useState<MatchState>("Wait")

    const [attackOptions, setAttackOptions] = useState<Set<CardValue>>(new Set())

    function drawCards(animation: Promise<void>, cards: ICard[], opDrawn: number, first: boolean) {
        let ac = animation
        let left = opDrawn
        if (!first && left > 0) {
            left--;
            const blank = blankCard(nextId.current++)
            ac = ac
                .then(() => setDeck(blank))
                .then(wait)
                .then(() => {
                    setDeck(undefined)
                    setOpHand((h) => h.concat(blank))
                })
                .then(wait)
        }
        for (let i = 0; i < cards.length; i++) {
                ac = ac
                    .then(() => setDeck(cards[i]))
                    .then(wait)
                    .then(() => {
                        setDeck(undefined)
                        setHand((h) => h.concat(cards[i]))
                    })
                    .then(wait)

                if (left > 0) {
                    left--
                    const blank = blankCard(nextId.current++)
                    ac = ac
                        .then(() => setDeck(blank))
                        .then(wait)
                        .then(() => {
                            setDeck(undefined)
                            setOpHand((h) => h.concat(blank))
                        })
                        .then(wait)
                }
        }

        while (left > 0) {
            left--
            const blank = blankCard(nextId.current++)
            ac = ac
                .then(() => setDeck(blank))
                .then(wait)
                .then(() => {
                    setDeck(undefined)
                    setOpHand((h) => h.concat(blank))
                })
                .then(wait)
        }
        
        return ac
    }

    function playCard(animation: Promise<void>, card1: ICard, card2?: ICard) {
        return animation
            .then(() => {
                setOpHand((h) => removeLast(h).concat(card1))
            })
            .then(wait)
            .then(() => {
                setOpHand((h) => removeLast(h))
                setBoard((b) => boardAdd(b, card1, card2))
            })
            .then(wait)
    }

    function opTakeBoard(animation: Promise<void>, except?: ICard) {
        const cards = _.reverse(_.zip.apply(_, board)).flat().filter((c) => c !== undefined && c !== except) as ICard[]

        return animation
            .then(() => {
                setOpHand((h) => h.concat(cards))
                setBoard((b) => cards.reduce((b1, card) => boardRemove(card, b1), b))
            })
            .then(waitLong)
            .then(() => setOpHand((h) => removeLast(h, cards.length).concat(cards.map(() => blankCard(nextId.current++)))))
            .then(wait)
    }

    function finishBoard(animation: Promise<void>) {
        const cards = _.reverse(_.zip.apply(_, board)).flat().filter((c) => c !== undefined) as ICard[]

        return animation
            .then(() => {
                setDiscard((d) => d.concat(cards))
                setBoard((b) => cards.reduce((b1, card) => boardRemove(card, b1), b))
            })
            .then(wait)
    }

    // Do animation then wait
    function wait(): Promise<void> {
        return new Promise((res) => setTimeout(res, 100))
    }

    function waitLong(): Promise<void> {
        return new Promise((res) => setTimeout(res, 400))
    }

    useEffect(() => {
        engine.attacked(player, (card) => {
            aContext.current = playCard(aContext.current, card)
            setMatchState("PendingDefence")
        });
        engine.defended(player, (card, against) => {
            console.log('defended', board.slice(0), card, against)
            aContext.current = playCard(aContext.current, card, against)
            setAttackOptions((ao) => new Set(ao).add(card.value))
            setMatchState("PendingAttack")
        });
        engine.reversed(player, (card) => {
            aContext.current = playCard(aContext.current, card)
            setAttacking(false)
            setMatchState("PendingDefence")
        });
        engine.drawn(player, (cards, opDrawn, first) => {
            aContext.current = drawCards(aContext.current, cards, opDrawn, first)
            setMatchState(attacking ? "PendingAttack" : "PendingDefence")
        })
        engine.conceded(player, () => {
            console.log('ai conceeded')
            setMatchState("PendingGrant")
            setAttackOptions(new Set())
        })
        engine.finished(player, () => {
            setAttacking(true)
            aContext.current = finishBoard(aContext.current)
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
    }, [board])

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
        setMatchState("Wait")

        return true
    }

    function reverse(card: ICard): boolean {
        if (attacking) {
            console.warn("Attacker cannot reverse")
            return false
        }

        if (board.length > 1 || board[0][1] !== undefined) {
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
        aContext.current = finishBoard(aContext.current)
        setMatchState("Wait")

        engine.finish(player)

        return true
    }

    function grantEnd(card?: ICard): Promise<void> {
        setToGrant([])
        if (!card) {

            setMatchState("PendingAttack")

        } else {
            attack(card)
            aContext.current = aContext.current.then(waitLong)
        }
        engine.grant(player, toGrant)
        aContext.current = opTakeBoard(aContext.current, card)

        return aContext.current
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