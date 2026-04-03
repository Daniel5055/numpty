import { cardToId, type ICard } from "../utils/card"
import Card from "./Card"

interface DrawPile {
  deck: ICard[]
  // Card at the bottom of the deck to indicate the trump
  trump?: ICard
}

// This is a visual
function Deck({ deck, trump }: DrawPile) {
  return (
    <div className="deck">
      {deck.map((c) => (
        <Card {...c} faceDown key={cardToId(c.suit, c.value, c.id)} />
      ))}
      {trump && (
        <div className={`trump ${deck.length > 0 ? "" : "taken"}`}>
          <Card key={cardToId(trump.suit, trump.value, trump.id)} {...trump} />
        </div>
      )}
    </div>
  )
}

export default Deck
