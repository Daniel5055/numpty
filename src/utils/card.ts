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

const faceCards = [CARD_VALUES.Jack, CARD_VALUES.Queen, CARD_VALUES.King]

export type CardValue = typeof CARD_VALUES[keyof typeof CARD_VALUES]

export interface ICard {
    suit: CardSuit
    value: CardValue
} 

export function cardToId(suit: CardSuit, value: CardValue) {
    return `${value}_${suit}`
}

export function cardToFile(suit: CardSuit, value: CardValue) {
    if (suit in faceCards) {
        return `${value}_of_${suit}2.png`
    } else {
        return `${value}_of_${suit}.png`
    }
}

