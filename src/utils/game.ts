import type { Board, ICard } from "./card"

export type MatchState =
  | "PendingAttack"
  | "PendingExtraAttack"
  | "PendingDefence"
  | "PendingGrant"
  | "Wait"
  | "GameOver"

export interface GameState {
  attacking: boolean
  matchState: MatchState
  trump?: ICard
  deckCount: number

  hand: ICard[]
  opHand: ICard[]
  board: Board
  deck?: ICard
  discard: ICard[]

  attack: (card: ICard) => boolean
  defend: (card: ICard, against: ICard) => boolean
  reverse: (card: ICard) => boolean
  concede: () => boolean
  finish: () => boolean
  grant: (card: ICard) => boolean
  grantEnd: (card?: ICard) => boolean
}

export type CardLocation = "Deck" | "Board" | "OpHand" | "MyHand"

export interface CardMove {
  from: CardLocation
  cards: [ICard, ICard?][]
  to: CardLocation
}
