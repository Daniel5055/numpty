export const CARD_SUITS = {
    Spades: "spades",
    Hearts: "hearts",
    Clubs: "clubs",
    Diamonds: "diamonds",
} as const

export type CardSuit = typeof CARD_SUITS[keyof typeof CARD_SUITS]

export const CARD_VALUES = {
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    Ten: "10",
    Jack: "jack",
    Queen: "queen",
    King: "king",
    Ace: "ace",
} as const

export type CardValue = typeof CARD_VALUES[keyof typeof CARD_VALUES]

export interface ICard {
    suit: CardSuit
    value: CardValue
} 

const faceCards: CardValue[] = [CARD_VALUES.Jack, CARD_VALUES.Queen, CARD_VALUES.King]


export const allCards: ICard[] = Object
    .values(CARD_SUITS)
    .flatMap((suit) => Object
        .values(CARD_VALUES)
        .map((value) => ({ suit, value })))

export function cardToId(suit: CardSuit, value: CardValue) {
    return `${value}_${suit}`
}

export function stackToId(card: ICard) {
    return `stack_${cardToId(card.suit, card.value)}`

}

export function cardToFile(suit: CardSuit, value: CardValue) {
    if (faceCards.includes(value)) {
        return `${value}_of_${suit}2.png`
    } else {
        return `${value}_of_${suit}.png`
    }
}

export function removeCard(cards: ICard[], card: ICard): ICard[] {
    const i = cards.findIndex((c) => c.suit === card.suit && c.value === card.value)
    if (i === -1) {
        //console.error("Could not remove card", card, "from", cards)
        return cards
    }

    return cards.splice(i, 1).slice(0)
}

export const handId = "hand"
export const boardId = "board"
