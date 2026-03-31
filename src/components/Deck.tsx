import { cardToId, type ICard } from "../utils/card"
import Card from "./Card"

interface DrawPile {
    deck: ICard[]
}

function Deck({ deck }: DrawPile) {
    return (
        <div className="deck">
            {deck.map((c) => <Card {...c} faceDown key={cardToId(c.suit, c.value)} />)}
        </div>
    )
}

export default Deck
