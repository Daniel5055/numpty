import type { Board, ICard } from "@repo/core/card"

export type MatchState =
  | "PendingAttack"
  | "PendingExtraAttack"
  | "PendingDefence"
  | "PendingGrant"
  | "Wait"
  | "Winner"
  | "Loser"

export interface GameState {
  attacking: boolean
  matchState: MatchState
  trump?: ICard
  deckCount: number
  caption: string

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
