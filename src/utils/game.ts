import type { Board, ICard } from "./card"

export type MatchState = "PendingAttack" | "PendingExtraAttack" | "PendingDefence" | "ReversalPendingDefence" | "Wait" | "PendingGrant"

export interface GameState {
    attacking: boolean

    matchState: MatchState

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
    grantEnd: (card?: ICard) => Promise<void>
}

export type CardLocation = "Deck" | "Board" | "OpHand" | "MyHand"

export interface CardMove {
    from: CardLocation
    cards: [ICard, ICard?][]
    to: CardLocation
}
