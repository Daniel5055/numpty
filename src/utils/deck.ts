import { MersenneTwister19937, Random } from "random-js";
import type { ICard } from "./card";

const random = new Random(MersenneTwister19937.seedWithArray([0, 1]))

export function shuffle(deck: ICard[]): ICard[] {
    const d = deck.slice(0)

    for (let i = 1; i < deck.length; i++) {
        const val = d[i]
        const j = random.integer(0, i)

        d[i] = d[j]
        d[j] = val
    }

    return d
}

export function draw(deck: ICard[]): ICard {
    const card = deck.pop()
    if (card === undefined) {
        throw Error("Empty deck")
    }

    return card
}
