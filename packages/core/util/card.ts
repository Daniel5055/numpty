import { isEqual } from "lodash-es"

export const CARD_SUITS = {
  Spades: "spades",
  Hearts: "hearts",
  Clubs: "clubs",
  Diamonds: "diamonds",
  Blank: "blank",
} as const

export type CardSuit = (typeof CARD_SUITS)[keyof typeof CARD_SUITS]

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
  Blank: "blank",
} as const

export type CardValue = (typeof CARD_VALUES)[keyof typeof CARD_VALUES]

const valueOrder = [
  CARD_VALUES.Two,
  CARD_VALUES.Three,
  CARD_VALUES.Four,
  CARD_VALUES.Five,
  CARD_VALUES.Six,
  CARD_VALUES.Seven,
  CARD_VALUES.Eight,
  CARD_VALUES.Nine,
  CARD_VALUES.Ten,
  CARD_VALUES.Jack,
  CARD_VALUES.Queen,
  CARD_VALUES.King,
  CARD_VALUES.Ace,
]
export function greaterValue(value1: CardValue, value2: CardValue): boolean {
  return (
    valueOrder.findIndex((v) => v === value1) >
    valueOrder.findIndex((v) => v === value2)
  )
}

export interface ICard {
  suit: CardSuit
  value: CardValue
  id?: number
}

export const blankCard = (id: number): ICard => ({
  suit: "blank",
  value: "blank",
  id,
})

const faceCards: CardValue[] = [
  CARD_VALUES.Jack,
  CARD_VALUES.Queen,
  CARD_VALUES.King,
]

export type Board = [ICard, ICard?][]

export const allCards: ICard[] = Object.values(CARD_SUITS)
  .flatMap((suit) =>
    Object.values(CARD_VALUES).map((value) => ({ suit, value })),
  )
  .filter(({ suit, value }) => suit !== "blank" && value !== "blank")

export function cardToId(suit: CardSuit, value: CardValue, id?: number) {
  if (id !== undefined) {
    return `${value}_${suit}_${id}`
  }
  return `${value}_${suit}`
}

export function cardToString(card: ICard) {
  return `${card.value} ${card.suit}`
}

export function stackToId(card: ICard) {
  return `stack_${cardToId(card.suit, card.value, card.id)}`
}

export function cardToFile(suit: CardSuit, value: CardValue) {
  if (faceCards.includes(value)) {
    return `${value}_of_${suit}2.png`
  } else {
    return `${value}_of_${suit}.png`
  }
}

export function removeCard(cards: ICard[], card: ICard): ICard[] {
  const i = cards.findIndex(
    (c) => c.suit === card.suit && c.value === card.value,
  )
  if (i === -1) {
    //console.error("Could not remove card", card, "from", cards)
    return cards
  }

  const copy = cards.slice(0)
  copy.splice(i, 1)
  return copy
}

export function removeLast(cards: ICard[], n = 1): ICard[] {
  const copy = cards.slice(0)
  copy.splice(-n)
  return copy
}

export const handId = "hand"
export const boardId = "board"

export function equalCards(card1?: ICard, card2?: ICard) {
  return card1?.suit === card2?.suit && card1?.value === card2?.value
}

export function includesCard(cards: ICard[], card: ICard): boolean {
  return cards.find((c) => isEqual(c, card)) !== undefined
}
