import { boardAdd } from "../board";
import { allCards, removeCard, type Board, type CardSuit, type CardValue, type ICard } from "../card";
import { draw, shuffle } from "../deck";
import { defaultHandlers, type AttackHandler, type DefendHandler, type DrawHandler, type EndHandler, type Engine, type GrantHandler, type Handlers, type ReverseHandler } from "./engine";

export class ClientEngine implements Engine {
    public player1: string
    public player2: string

    public attacker: string

    public trump: CardSuit

    private started = false

    private hands: Record<string, ICard[]> = {}
    #board: Board = []
    private deck: ICard[] = shuffle(allCards)

    private legalAttacks: Set<CardValue> = new Set()

    public round: number = 1

    private handlers: Record<string, Handlers> = {}

    private other(player: string) {
        return player === this.player1 ? this.player2 : this.player1
    }

    private drawStep(player: string) {
        const draw1 = Math.max(6 - this.hands[player].length, 0)
        const draw2 = Math.max(6 - this.hands[this.other(player)].length, 0)

        const cards1 = []
        for (let i = 0; i < draw1; i++) {
            cards1.push(draw(this.deck))
        }

        const cards2 = []
        for (let i = 0; i < draw2; i++) {
            cards2.push(draw(this.deck))
        }

        this.handlers[player].drawn(cards1, draw2, true)
        this.handlers[this.other(player)].drawn(cards2, draw1, false)

        this.hands[player] = this.hands[player].concat(cards1)
        this.hands[this.other(player)] = this.hands[this.other(player)].concat(cards2)

        this.round++
    }

    public hand(player: string): ICard[] {
        return this.hands[player]
    }

    public board(): Board {
        return this.#board
    }

    constructor(player1: string, player2: string, trump: CardSuit) {
        this.trump = trump
        this.player1 = player1
        this.player2 = player2
        this.attacker = player1

        this.hands[player1] = []
        this.hands[player2] = []

        this.handlers[player1] = { ...defaultHandlers }
        this.handlers[player2] = { ...defaultHandlers }
    }

    start() {
        if (!this.started) {
            this.started = true
            this.drawStep(this.attacker)
        }
    }

    attack(player: string, card: ICard) {
        setTimeout(() => {
        if (player !== this.attacker) {
            throw new Error("Defender cannot attack")
        }

        if (this.legalAttacks.size > 1 && !this.legalAttacks.has(card.value)) {
            console.error(card, this.legalAttacks)
            throw new Error("Not a valid attack")
        }

        this.#board = boardAdd(this.#board, card)
        this.hands[player] = removeCard(this.hands[player], card)

        this.legalAttacks.add(card.value)

        // Notify other player
        this.handlers[this.other(player)].attacked(card)
    },100)
    }

    defend(player: string, card: ICard, against: ICard) {
        setTimeout(() => {
        if (player === this.attacker) {
            throw new Error("Attacker cannot defend")
        }

        this.#board = boardAdd(this.#board, card, against)
        this.hands[player] = removeCard(this.hands[player], card)

        this.legalAttacks.add(card.value)
        
        // Notify other player
        this.handlers[this.other(player)].defended(card, against)
    },100)
    }

    reverse(player: string, card: ICard) {
        setTimeout(() => {
        if (player === this.attacker) {
            throw new Error("Attacker cannot reverse")
        }

        this.#board = boardAdd(this.#board, card)
        this.hands[player] = removeCard(this.hands[player], card)

        // Reverse roles 
        this.attacker = player
        
        // Notify other player
        this.handlers[this.other(player)].reversed(card)
        }, 100)
    }
    concede(player: string) {
        setTimeout(() => {
            this.hands[player].push(...this.#board.flat().filter((c) => c !== undefined))
            this.#board = []
            this.legalAttacks.clear()

            this.handlers[this.other(player)].conceded()
        }, 100)
    }
    finish(player: string) {
        this.legalAttacks.clear()
        console.log('finish')
        this.attacker = this.other(player)

        this.handlers[this.other(player)].finished()

        this.#board = []

        setTimeout(() => {
            this.drawStep(player)
        }, 100)
    }
    grant(player: string, cards: ICard[]) {
        setTimeout(() => {
            for (const card of cards) {
                this.hands[player] = removeCard(this.hands[player], card)
            }

            this.hands[this.other(player)] = this.hands[this.other(player)].concat(cards)

            this.handlers[this.other(player)].granted(cards)
        }, 100)
    }


    attacked(player: string, onAttack: AttackHandler) {
        this.handlers[player].attacked = onAttack
    }
    defended(player: string, onDefend: DefendHandler) {
        this.handlers[player].defended = onDefend
    }
    reversed(player: string, onReverse: ReverseHandler) {
        this.handlers[player].reversed = onReverse
    }
    drawn(player: string, onDraw: DrawHandler) {
        this.handlers[player].drawn = onDraw
    }
    conceded(player: string, onConcede: EndHandler) {
        this.handlers[player].conceded = onConcede
    }
    finished(player: string, onFinished: EndHandler) {
        this.handlers[player].finished = onFinished
    }
    granted(player: string, onGranted: GrantHandler) {
        this.handlers[player].granted = onGranted
    }
}