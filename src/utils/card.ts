export const CardSuit = {
    Spades: "spades",
    Hearts: "hearts",
    Clubs: "clubs",
    Diamonds: "diamonds",
} as const

export const CardValue = {
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    jack: "jack",
    queen: "queen",
    king: "king",
    ace: "ace",
} as const

export function cardToId(suit: string, value: string) {
    return `${value}_${suit}`
}

export function cardToFile(suit: string, value: string) {
    if (suit in [CardValue.jack, CardValue.queen, CardValue.king]) {
        return `${value}_of_${suit}2.png`
    } else {
        return `${value}_of_${suit}.png`
    }
}

