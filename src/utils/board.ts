import { cloneDeep } from "lodash-es";
import { equalCards, greaterValue, type Board, type CardSuit, type CardValue, type ICard } from "./card";

export function boardRemove(card: ICard, board: Board): Board {
    return board
        .filter(([a,]) => !equalCards(card, a))
        .map(([a, d]): [ICard, ICard?] => {
            if (equalCards(card, d)) {
                return [a]
            } else {
                return [a, d]
            }
        })
}

export function boardAdd(board: Board, card: ICard, against?: ICard): Board {
    // If attacking
    if (against === undefined) {
        return cloneDeep(board).concat([[card]])
    } 

    // If defending
    const i = board.findIndex(([a, d]) => equalCards(a, against) && !d)

    if (i === -1) {
        console.error(card, against, board.slice())
        throw new Error("cannot add to board")
    }

    const copy = cloneDeep(board)
    if (copy[i].length == 1) {
        copy[i].push(card);
    } else {
        copy[i][1] = card
    }

    return copy
}

export function boardUnresolved(board: Board): ICard[] {
    return board.filter(([,d]) => d === undefined).map(([a]) => a)
}

export function boardUnique(board: Board): CardValue[] {
    const vals = board.flatMap(([a, d]) => [a.value, d?.value]).filter((c) => c !== undefined)
    return [...new Set(vals)]
}

export function validDefence(card: ICard, cards: ICard[], trump: CardSuit): ICard[] {
    if (card.suit === trump) {
        return cards.filter((c) => c.suit === trump && greaterValue(c.value, card.value))
    } else {
        return cards.filter((c) => c.suit === trump || (c.suit === card.suit && greaterValue(c.value, card.value)))
    }
}

export function boardReversible(board: Board) {
    return boardUnresolved(board).length === board.length && boardUnique(board).length === 1
}
