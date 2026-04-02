import { useEffect, useRef, useState } from "react";
import {  blankCard,  removeCard, removeLast, type CardValue, type ICard } from "../utils/card";
import { type MatchState, type GameState, type CardMove, type CardLocation } from "../utils/game";
import type { Engine } from "../utils/engines/engine";
import { boardAdd, boardRemove } from "../utils/board";

function useGameState(player: string ,engine: Engine): GameState {
    const nextId = useRef(0)

    const [attacker, setAttacker] = useState<string>("player1") 
    const [defender, setDefender] = useState<string>("player2") 

    const [attacking, setAttacking] = useState<boolean>(true)

    const [toGrant, setToGrant] = useState<ICard[]>([])

    const aContext = useRef<Promise<void>>(Promise.resolve())

    const [hand, setHand] = useState<ICard[]>([])
    const [deck, setDeck] = useState<ICard | null>()
    const [opHand, setOpHand] = useState<ICard[]>([])
    const [board, setBoard] = useState<[ICard, ICard?][]>([])

    const [matchState, setMatchState] = useState<MatchState>("Wait")

    const [attackOptions, setAttackOptions] = useState<Set<CardValue>>(new Set())

    function moveCards(move:  CardMove | undefined) {
        if (move) {
            const {from, to, cards} = move
            aContext.current = cards.reduce((a, [card1, card2]) => moveCard(a, from, to, card1, card2), aContext.current)
        }
    }

    // Do animation then wait
    function wait(): Promise<void> {
        return new Promise((res) => setTimeout(res, 100))
    }

    function moveCard(animation: Promise<void>, from: CardLocation, to: CardLocation, card1: ICard, card2?: ICard): Promise<void> {
        switch (from) {
            case "Deck":
                // Cards can move from deck to either hands
                if (to === "MyHand") {
                    return animation
                        .then(() => setDeck(card1))
                        .then(wait)
                        .then(() => {
                            setHand((h) => h.concat(card1));
                            setDeck(null);
                        })
                        .then(wait)
                } else {
                    return animation
                        .then(() => setDeck(card1))
                        .then(wait)
                        .then(() => {
                            setOpHand((h) => h.concat(card1))
                            setDeck(null);
                        })
                        .then(wait)
                }
            case "Board":
                // Cards can move from board to either hands 
                if (to === "MyHand") {
                    return animation
                        .then(() => {
                            setHand((h) => h.concat(card1))
                            setBoard((b) => boardRemove(card1, b))
                        })
                        .then(wait)
                } else {
                    return animation
                        .then(() => {
                            setOpHand((h) => h.concat(card1))
                            setBoard((b) => boardRemove(card1, b))
                        })
                        .then(wait)
                }
            case "OpHand":
                if (to === "Board" && card2) {
                    return animation
                        .then(() => {
                            setOpHand((h) => removeLast(h).concat(card1))
                        })
                        .then(wait)
                        .then(() => {
                            setBoard((b) => boardAdd(b, card1, card2))
                        })
                        .then(wait)
                }
                break
        }

        return animation
    }

    useEffect(() => {
        engine.attacked(player, (card) => {
            setBoard((b) => boardAdd(b, card))
            setOpHand(removeLast)
            setMatchState("PendingDefence")
        });
        engine.defended(player, (card, against) => {
            console.log('defended', board.slice(0), card, against)
            setBoard((b) => boardAdd(b, card, against))
            setOpHand(removeLast)
            setAttackOptions((ao) => new Set(ao).add(card.value))
            setMatchState("PendingAttack")
        });
        engine.reversed(player, (card) => {
            setBoard((b) => boardAdd(b, card))
            setOpHand(removeLast)
            setAttacking(false)
            setMatchState("PendingDefence")
        });
        engine.drawn(player, (cards, opDrawn) => {
            setHand((h) => h.concat(cards))
            const ids = Array.from({length: opDrawn}, () => nextId.current++)
            const blanks = ids.map((id) => blankCard(id))
            setOpHand((h) => h.concat(blanks))
            setMatchState(attacking ? "PendingAttack" : "PendingDefence")
        })
        engine.conceded(player, () => {
            setMatchState("PendingGrant")
            setAttackOptions(new Set())
        })
        engine.finished(player, () => {
            setAttacking(true)
            setBoard([])
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

        setBoard([])
        setAttacking(false)
        setMatchState("Wait")

        engine.finish(player)

        return true
    }

    function grantEnd(): boolean {
        const blanks = toGrant.map(() => blankCard(nextId.current++))
        setToGrant([])
        setBoard([])
        setMatchState("PendingAttack")

        const cards = board
            .flat()
            .filter((c) => c != undefined)
            .map(() => blankCard(nextId.current++))
        setOpHand((h) => h.concat(cards).concat(blanks))

        return true
    }

    function grant(card: ICard): boolean {
        setBoard((b) => boardAdd(b, card))
        setToGrant((g) => g.concat(card))

        return true
    }

    return {
        attacker,
        defender,
        matchState,

        attacking,

        // Card states
        hand,
        opHand,
        board,

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