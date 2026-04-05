import type { Socket } from "socket.io-client"
import { boardAdd } from "../util/board"
import { type Board, type ICard, removeCard } from "../util/card"
import type { Handlers } from "./Engine"
import RemoteEngine from "./RemoteEngine"
import type { IStateEngine } from "./StateEngine"

class RemoteStateEngine extends RemoteEngine implements IStateEngine {
  socket: Socket

  private _trumpCard?: ICard
  private _attacking: boolean
  private _board: Board
  private _hand: ICard[]

  constructor(socket: any) {
    super(socket)
    this.socket = socket
    this._hand = []
    this._board = []
    this._attacking = false
  }

  attacking(_: string): boolean {
    return this._attacking
  }

  public get trumpCard(): ICard {
    if (!this._trumpCard) {
      throw Error("Cannot get trump before start")
    }

    return this._trumpCard
  }

  hand(_: string): ICard[] {
    return this._hand
  }

  board(): Board {
    return this._board
  }

  attack(id: string, card: ICard): void {
    this._hand = removeCard(this._hand, card)
    this._board = boardAdd(this._board, card)

    super.attack(id, card)
  }
  defend(id: string, card: ICard, against: ICard) {
    this._hand = removeCard(this._hand, card)
    this._board = boardAdd(this._board, card, against)

    super.defend(id, card, against)
  }
  reverse(id: string, card: ICard) {
    this._hand = removeCard(this._hand, card)
    this._board = boardAdd(this._board, card)
    this._attacking = true

    super.reverse(id, card)
  }
  concede(id: string) {
    this._hand.push(...this._board.flat().filter((c) => c !== undefined))
    this._board = []

    super.concede(id)
  }
  finish(id: string) {
    this._attacking = false
    this._board = []

    super.finish(id)
  }
  grant(_: string, cards: ICard[]) {
    for (const card of cards) {
      this._hand = removeCard(this._hand, card)
    }

    super.grant(_, cards)
  }

  register(id: string, handlers: Handlers) {
    super.register(id, {
      attacked: (card) => {
        this._board = boardAdd(this._board, card)

        return handlers.attacked(card)
      },
      defended: (card, against) => {
        this._board = boardAdd(this._board, card, against)

        return handlers.defended(card, against)
      },
      reversed: (card) => {
        boardAdd(this._board, card)
        this._attacking = false

        return handlers.reversed(card)
      },
      conceded: () => {
        this._board = []

        return handlers.conceded()
      },
      finished: () => {
        this._attacking = true
        this._board = []

        return handlers.finished()
      },
      granted: (cards) => {
        this._hand.push(...cards)

        return handlers.granted(cards)
      },
      drawn: (cards, opDrawn, first, trump) => {
        this._hand.push(...cards)

        return handlers.drawn(cards, opDrawn, first, trump)
      },
      gameStart: (attacking, trump, deck) => {
        this._attacking = attacking
        this._trumpCard = trump
        console.log("game started")

        return handlers.gameStart(attacking, trump, deck)
      },
      gameEnd: (win) => {
        return handlers.gameEnd(win)
      },
    })
  }
}

export default RemoteStateEngine
