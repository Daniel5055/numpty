import type { Random } from "random-js"
import { boardAdd } from "../util/board"
import {
  allCards,
  type Board,
  type CardValue,
  type ICard,
  removeCard,
} from "../util/card"
import { draw } from "../util/deck"
import { defaultHandlers, type Engine, type Handlers } from "./Engine"

export class CoreEngine implements Engine {
  protected player1: string
  protected player2: string
  protected _attacker: string

  // Flags
  protected started = false
  protected emptyDeck = false
  protected gameOver = false

  // board state
  protected hands: Record<string, ICard[]> = {}
  protected _board: Board = []
  protected deck: ICard[] = allCards.slice(0)

  // Extra info
  protected legalAttacks: Set<CardValue> = new Set()
  protected handlers: Record<string, Handlers> = {}
  protected random: Random
  protected _trumpCard?: ICard

  protected other(player: string) {
    return player === this.player1 ? this.player2 : this.player1
  }

  protected get trumpCard(): ICard {
    if (!this._trumpCard) {
      throw Error("Cannot get trump before start")
    }

    return this._trumpCard
  }

  private hasWon(player: string): boolean {
    if (this.hands[player].length === 0) {
      this.gameOver = true
      return true
    } else {
      return false
    }
  }

  private drawStep(player: string) {
    const draw1 = Math.max(6 - this.hands[player].length, 0)
    const draw2 = Math.max(6 - this.hands[this.other(player)].length, 0)

    const draw = draw1 + draw2

    // Draw out cards, maybe including trump
    const dc = draw > 0 ? this.deck.slice(-draw) : []
    const emptyDeck = draw > this.deck.length
    const drawnCards =
      emptyDeck && !this.emptyDeck ? [this.trumpCard, ...dc] : dc

    // Update deck state
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
  }

  constructor(player1: string, player2: string, random: Random) {
    this.player1 = player1
    this.player2 = player2
    this._attacker = player1

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
      this._trumpCard = draw(this.deck)

      this.drawStep(this._attacker)
    }

    return this.trumpCard
  }

  attack(player: string, card: ICard) {
    if (this.gameOver) return

    //setTimeout(() => {
    if (player !== this._attacker) {
      throw new Error("Defender cannot attack")
    }

    if (this.legalAttacks.size > 1 && !this.legalAttacks.has(card.value)) {
      console.error(card, this.legalAttacks)
      throw new Error("Not a valid attack")
    }

    this._board = boardAdd(this._board, card)
    this.hands[player] = removeCard(this.hands[player], card)

    this.legalAttacks.add(card.value)
    this.handlers[this.other(player)].attacked(card)

    if (this.hasWon(player)) {
      this.handlers[player].gameOver(true)
      this.handlers[this.other(player)].gameOver(false)
    }
    //}, 100)
  }

  defend(player: string, card: ICard, against: ICard) {
    if (this.gameOver) return

    // Cannot make this with settimeout as ai can call it repeatedly
    if (player === this._attacker) {
      throw new Error("Attacker cannot defend")
    }

    this._board = boardAdd(this._board, card, against)
    this.hands[player] = removeCard(this.hands[player], card)

    this.legalAttacks.add(card.value)
    this.handlers[this.other(player)].defended(card, against)

    if (this.hasWon(player)) {
      this.handlers[player].gameOver(true)
      this.handlers[this.other(player)].gameOver(false)
    }
  }

  reverse(player: string, card: ICard) {
    if (this.gameOver) return

    //setTimeout(() => {
    if (player === this._attacker) {
      throw new Error("Attacker cannot reverse")
    }

    this._board = boardAdd(this._board, card)
    this.hands[player] = removeCard(this.hands[player], card)

    // Reverse roles
    this._attacker = player
    // Notify other player
    this.handlers[this.other(player)].reversed(card)

    if (this.hasWon(player)) {
      this.handlers[player].gameOver(true)
      this.handlers[this.other(player)].gameOver(false)
    }
    //}, 100)
  }
  concede(player: string) {
    if (this.gameOver) return

    //setTimeout(() => {
    this.hands[player].push(
      ...this._board.flat().filter((c) => c !== undefined),
    )
    this._board = []
    this.legalAttacks.clear()

    this.handlers[this.other(player)].conceded()
    //}, 100)
  }
  finish(player: string) {
    if (this.gameOver) return

    this.legalAttacks.clear()
    this._attacker = this.other(player)

    this.handlers[this.other(player)].finished()

    this._board = []

    //setTimeout(() => {
    this.drawStep(player)
    //}, 100)
  }
  grant(player: string, cards: ICard[]) {
    if (this.gameOver) return

    //setTimeout(() => {
    for (const card of cards) {
      this.hands[player] = removeCard(this.hands[player], card)
    }

    this.hands[this.other(player)].push(...cards)
    this.handlers[this.other(player)].granted(cards)

    if (this.hasWon(player)) {
      this.handlers[player].gameOver(true)
      this.handlers[this.other(player)].gameOver(false)
    }
    //}, 100)
  }

  register(id: string, handlers: Handlers) {
    this.handlers[id] = handlers
  }
}

export function mkClientEngine(
  id1: string,
  id2: string,
  random: Random,
): CoreEngine {
  return new CoreEngine(id1, id2, random)
}
