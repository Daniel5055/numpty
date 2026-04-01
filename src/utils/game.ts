import type { ICard } from "./card"

export type MatchState = "PendingAttack" | "PendingDefence" | "ReversalPendingDefence" | "MatchOver" | "PendingExtras"

export interface GameState {
    attacker: string
    defender: string
    attacking: boolean

    matchState: MatchState

    hand: ICard[]
    deck: ICard[]
    board: [ICard, ICard?][]

    draw: (n?: number) => void
    attack: (card: ICard) => boolean
    defend: (card: ICard, against: ICard) => boolean
    concede: () => boolean
    finish: () => boolean
}
