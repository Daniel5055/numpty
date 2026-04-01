import { useEffect, useRef, useState } from "react";
import { allCards,  removeCard, type CardValue, type ICard } from "../utils/card";
import { type MatchState, type GameState } from "../utils/game";


function useGameState(): GameState {
    const [attacker, setAttacker] = useState<string>("player1") 
    const [defender, setDefender] = useState<string>("player2") 

    const [attacking, setAttacking] = useState<boolean>(true)

    const [hand, setHand] = useState<ICard[]>([])
    const [deck, setDeck] = useState<ICard[]>(allCards)

    function draw(n: number = 1) {
        for (let i = 0; i < n; i++) {
            setHand((h) => h.concat(deck.slice(0, n)))
            setDeck((d) => d.slice(n))
        }
    }

    useEffect(() => {
    }, []) 

    const [board, setBoard] = useState<[ICard, ICard?][]>([])

    const [matchState, setMatchstate] = useState<MatchState>("PendingAttack")

    const [attackOptions, setAttackOptions] = useState<CardValue[]>([])

    function attack(card: ICard): boolean {
        console.log('Attack', card)
        if (!attacking) {
            console.warn("Defender cannot attack")
            return false
        }

        if (attackOptions.length > 0 && !attackOptions.includes(card.value)) {
            console.warn("Attacker must attack with valid card value")
            console.warn('options:', attackOptions)
            return false
        }

        setAttackOptions((ao) => ao.concat(card.value))
        setBoard((b) => b.concat([[card, undefined]]))
        setHand((h) => removeCard(h, card))

        // TODO Debug
        setAttacking(false)

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

        setBoard((b) => { const c = b.slice(0); c[i][1] = card; return c })
        setHand((h) => removeCard(h, card))

        setAttackOptions((ao) => ao.concat(card.value))

        // TODO Debug
        setAttacking(true)

        return true
    }

    function concede(): boolean {
        if (attacking) {
            console.warn("Attacker cannot concede")
            return false
        }

        return true
    }

    function finish(): boolean {
        if (!attacking) {
            console.warn("Defender cannot finish")
            return false
        }

        return true
    }

    return {
        attacker,
        defender,
        matchState,

        attacking,

        // Card states
        hand,
        board,
        deck,

        // Interaction
        draw,
        attack,
        defend,
        concede,
        finish,
    }
}

export default useGameState