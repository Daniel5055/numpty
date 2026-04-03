import type { Random } from "random-js"
import type { Board, ICard } from "../card"

export type AttackHandler = (card: ICard) => void
export type DefendHandler = (card: ICard, against: ICard) => void
export type ReverseHandler = (card: ICard) => void
export type DrawHandler = (
  cards: ICard[],
  opDrawn: number,
  first: boolean,
  trump?: ICard,
) => void
export type EndHandler = () => void
export type GrantHandler = (cards: ICard[]) => void

export interface Handlers {
  attacked: AttackHandler
  defended: DefendHandler
  reversed: ReverseHandler
  drawn: DrawHandler
  conceded: EndHandler
  finished: EndHandler
  granted: GrantHandler
}

export const defaultHandlers: Handlers = {
  attacked: () => null,
  defended: () => null,
  reversed: () => null,
  drawn: () => null,
  conceded: () => null,
  finished: () => null,
  granted: () => null,
}

export type MkEngine = (id1: string, id2: string, random: Random) => Engine

export interface Engine {
  // Access game state
  hand: (player: string) => ICard[]
  board: () => Board
  trumpCard: ICard
  attacker: string

  // Beginning the game, and returning the trump card
  start: () => ICard

  attack: (id: string, card: ICard) => void
  defend: (id: string, card: ICard, against: ICard) => void
  reverse: (id: string, card: ICard) => void
  concede: (id: string) => void
  finish: (id: string) => void
  grant: (id: string, cards: ICard[]) => void

  register: (id: string, handlers: Handlers) => void
}
