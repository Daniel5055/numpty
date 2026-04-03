import type { ICard } from "./card"

export function draw(deck: ICard[]): ICard {
  const card = deck.pop()
  if (card === undefined) {
    throw Error("Empty deck")
  }

  return card
}
