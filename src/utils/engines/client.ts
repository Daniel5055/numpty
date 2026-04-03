import type { Random } from "random-js"
import { boardAdd } from "../board"
import {
  allCards,
  type Board,
  type CardValue,
  type ICard,
  removeCard,
} from "../card"
import { draw } from "../deck"
import { defaultHandlers, type Engine, type Handlers } from "./engine"

export class ClientEngine implements Engine {
  public player1: string
  public player2: string
  public attacker: string

  // Flags
  private started = false
  private emptyDeck = false

  // board state
  private hands: Record<string, ICard[]> = {}
  #board: Board = []
  private deck: ICard[] = allCards

  // Extra info
  private legalAttacks: Set<CardValue> = new Set()
  public round: number = 1
  private handlers: Record<string, Handlers> = {}
  private random: Random
  #trumpCard?: ICard

  private other(player: string) {
    return player === this.player1 ? this.player2 : this.player1
  }

  get trumpCard(): ICard {
    if (!this.#trumpCard) {
      throw Error("Cannot get trump before start")
    }

    return this.#trumpCard
  }

  private drawStep(player: string) {
    const draw1 = Math.max(6 - this.hands[player].length, 0)
    const draw2 = Math.max(6 - this.hands[this.other(player)].length, 0)

    const draw = draw1 + draw2

    // Draw out cards, maybe including trump
    const dc = this.deck.slice(-draw)
    const drawnCards = draw > this.deck.length ? [this.trumpCard, ...dc] : dc

    // Update deck state
    const emptyDeck = draw > this.deck.length
    this.deck.splice(-draw)

    const cards1 = []
    const cards2 = []

    for (let i = drawnCards.length - 1; i >= 0; i--) {
      // Alternate drawing or draw if the other can't anymore
      if (
        ((drawnCards.length - i - 1) % 2 === 0 && cards1.length < draw1) ||
        cards2.length == draw2
      ) {
        cards1.push(drawnCards[i])
      } else {
        cards2.push(drawnCards[i])
      }
    }

    // Trump card can only be drawn once
    this.handlers[player].drawn(
      cards1,
      cards2.length,
      true,
      !this.emptyDeck && emptyDeck ? this.trumpCard : undefined,
    )
    this.handlers[this.other(player)].drawn(
      cards2,
      cards1.length,
      false,
      !this.emptyDeck && emptyDeck ? this.trumpCard : undefined,
    )

    this.hands[player] = this.hands[player].concat(cards1)
    this.hands[this.other(player)] =
      this.hands[this.other(player)].concat(cards2)

    this.emptyDeck = emptyDeck
    this.round++
  }

  public hand(player: string): ICard[] {
    return this.hands[player]
  }

  public board(): Board {
    return this.#board
  }

  constructor(player1: string, player2: string, random: Random) {
    this.player1 = player1
    this.player2 = player2
    this.attacker = player1

    this.hands[player1] = []
    this.hands[player2] = []

    this.handlers[player1] = { ...defaultHandlers }
    this.handlers[player2] = { ...defaultHandlers }

    this.random = random

    // Shuffle the deck
    this.random.shuffle(this.deck)
  }

  start(): ICard {
    if (!this.started) {
      this.started = true
      this.#trumpCard = draw(this.deck)

      this.drawStep(this.attacker)
    }

    return this.trumpCard
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
    }, 100)
  }

  defend(player: string, card: ICard, against: ICard) {
    if (player === this.attacker) {
      throw new Error("Attacker cannot defend")
    }

    this.#board = boardAdd(this.#board, card, against)
    this.hands[player] = removeCard(this.hands[player], card)

    this.legalAttacks.add(card.value)

    // Notify other player
    this.handlers[this.other(player)].defended(card, against)
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
      this.hands[player].push(
        ...this.#board.flat().filter((c) => c !== undefined),
      )
      this.#board = []
      this.legalAttacks.clear()

      this.handlers[this.other(player)].conceded()
    }, 100)
  }
  finish(player: string) {
    this.legalAttacks.clear()
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

      this.hands[this.other(player)] =
        this.hands[this.other(player)].concat(cards)

      this.handlers[this.other(player)].granted(cards)
    }, 100)
  }

  register(id: string, handlers: Handlers) {
    this.handlers[id] = handlers
  }
}

export function mkClientEngine(
  id1: string,
  id2: string,
  random: Random,
): ClientEngine {
  return new ClientEngine(id1, id2, random)
}
