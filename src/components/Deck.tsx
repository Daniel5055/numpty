import { CARD_SUITS, CARD_VALUES, cardToId, type ICard } from "../utils/card"
import Card from "./Card"

interface DrawPile {
    deck: ICard[]
}

// This is a visual 
function Deck({ deck }: DrawPile) {
    return (
        <div className="deck">
            {deck.map((c) => <Card {...c} faceDown key={cardToId(c.suit, c.value, c.id)} />)}
        </div>
    )
}

export default Deck
