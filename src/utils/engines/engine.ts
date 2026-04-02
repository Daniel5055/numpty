import type { Board, CardSuit, ICard } from "../card";

export type AttackHandler = (card: ICard) => void 
export type DefendHandler = (card: ICard, against: ICard) => void 
export type ReverseHandler = (card: ICard) => void 
export type DrawHandler = (cards: ICard[], opDrawn: number, first: boolean) => void 
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

export interface Engine {
    trump: CardSuit

    attacker: string

    hand: (player: string) => ICard[]
    board: () => Board

    start: () => void

    attack: (player: string, card: ICard) => void
    defend: (player: string, card: ICard, against: ICard) => void
    reverse: (player: string, card: ICard) => void
    concede: (player: string) => void
    finish: (player: string) => void
    grant: (player: string, cards: ICard[]) => void

    attacked: (player: string, onAttack: AttackHandler) => void
    defended: (player: string, onDefend: DefendHandler) => void
    reversed: (player: string, onReversed: ReverseHandler) => void
    drawn: (player: string, onDraw: DrawHandler) => void
    conceded: (player: string, onConcede: EndHandler) => void
    finished: (player: string, onFinished: EndHandler) => void
    granted: (player: string, onGrant: GrantHandler) => void
}