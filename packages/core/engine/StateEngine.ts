import { allCards, type Board, type ICard, removeCard } from "@repo/core/card"
import type { Engine, Handlers } from "@repo/core/engine"
import { boardAdd } from "../util/board"
import { draw } from "../util/deck"

export interface IStateEngine extends Engine {
  attacking: (id: string) => boolean
  trumpCard: ICard
  hand: (id: string) => ICard[]
  board: () => Board
}

// engine stores and exposes state to be used
abstract class StateEngine implements IStateEngine {
  protected player1: string
  protected player2: string
  protected _attacker: string
  protected ready1: boolean
  protected ready2: boolean

  // Flags
  protected emptyDeck = false

  // board state
  protected hands: Record<string, ICard[]> = {}
  protected _board: Board = []
  protected deck: ICard[] = allCards.slice(0)

  protected _trumpCard?: ICard

  constructor(player1: string, player2: string) {
    this.player1 = player1
    this.player2 = player2
    this._attacker = player1

    this.hands[player1] = []
    this.hands[player2] = []

    this.ready1 = false
    this.ready2 = false
  }

  ready(id: string) {
    if (id == this.player1) {
      this.ready1 = true
    } else {
      this.ready2 = true
    }

    if (this.ready1 && this.ready2) {
      this._trumpCard = draw(this.deck)
    }
  }

  attack(id: string, card: ICard) {
    this._board = boardAdd(this._board, card)
    this.hands[id] = removeCard(this.hands[id], card)
  }
  defend(id: string, card: ICard, against: ICard) {
    this._board = boardAdd(this._board, card, against)
    this.hands[id] = removeCard(this.hands[id], card)
  }
  reverse(id: string, card: ICard) {
    this._board = boardAdd(this._board, card)
    this.hands[id] = removeCard(this.hands[id], card)

    // Reverse roles
    this._attacker = id
  }
  concede(id: string) {
    this.hands[id].push(...this._board.flat().filter((c) => c !== undefined))
    this._board = []
  }
  finish(id: string) {
    this._attacker = this.other(id)
    this._board = []
  }
  grant(id: string, cards: ICard[]) {
    for (const card of cards) {
      this.hands[id] = removeCard(this.hands[id], card)
    }

    this.hands[this.other(id)].push(...cards)
  }

  protected draw(id: string): {
    cards1: ICard[]
    cards2: ICard[]
    trump: boolean
  } {
    const draw1 = Math.max(6 - this.hands[id].length, 0)
    const draw2 = Math.max(6 - this.hands[this.other(id)].length, 0)

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

    this.hands[id] = this.hands[id].concat(cards1)
    this.hands[this.other(id)] = this.hands[this.other(id)].concat(cards2)

    // If the trump is drawn
    const trump = this.emptyDeck && emptyDeck

    this.emptyDeck = emptyDeck

    return { cards1, cards2, trump }
  }

  abstract register(id: string, handlers: Handlers): void
  abstract deregister(id: string): void

  attacking(id: string): boolean {
    return this._attacker == id
  }

  public get trumpCard(): ICard {
    if (!this._trumpCard) {
      throw Error("Cannot get trump before start")
    }

    return this._trumpCard
  }

  hand(id: string): ICard[] {
    return this.hands[id]
  }

  board(): Board {
    return this._board
  }

  protected other(id: string) {
    return id === this.player1 ? this.player2 : this.player1
  }
}

export default StateEngine
