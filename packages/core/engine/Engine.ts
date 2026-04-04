import type { ICard } from "../util/card"

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
export type GameStartHandler = (
  attacking: boolean,
  trump: ICard,
  deck: ICard[],
) => void
export type GameOverHandler = (win: boolean) => void

export interface Handlers {
  attacked: AttackHandler
  defended: DefendHandler
  reversed: ReverseHandler
  drawn: DrawHandler
  conceded: EndHandler
  finished: EndHandler
  granted: GrantHandler
  gameStart: GameStartHandler
  gameEnd: GameOverHandler
}

export const defaultHandlers: Handlers = {
  attacked: () => null,
  defended: () => null,
  reversed: () => null,
  drawn: () => null,
  conceded: () => null,
  finished: () => null,
  granted: () => null,
  gameStart: () => null,
  gameEnd: () => null,
}

export interface Engine {
  // Beginning the game, and returning the trump card
  start: () => void

  attack: (id: string, card: ICard) => void
  defend: (id: string, card: ICard, against: ICard) => void
  reverse: (id: string, card: ICard) => void
  concede: (id: string) => void
  finish: (id: string) => void
  grant: (id: string, cards: ICard[]) => void

  register: (id: string, handlers: Handlers) => void
  deregister: (id: string) => void
}
