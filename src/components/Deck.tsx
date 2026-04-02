import { CARD_SUITS, CARD_VALUES, cardToId, type ICard } from "../utils/card"
import Card from "./Card"

interface DrawPile {
    staged?: ICard
}

// This is a visual 
function Deck({ staged }: DrawPile) {
    return (
        <div className="deck">
            <Card suit={CARD_SUITS.Blank} value={CARD_VALUES.Blank} id={-1} faceDown />
            {staged && <Card {...staged} faceDown />}
        </div>
    )
}

export default Deck
