import { useDroppable } from "@dnd-kit/react"
import { cardToId, type ICard } from "@repo/core/card"
import Card from "./Card"

interface HandProps {
  hand: ICard[]
  opponent: boolean
}

function Hand({ hand, opponent }: HandProps) {
  const { ref } = useDroppable({
    id: "hand",
  })

  return (
    <div ref={ref} className="hand">
      {hand.map((c) => (
        <div
          className="card-in-hand"
          key={`hand_${cardToId(c.suit, c.value, c.id)}`}
        >
          <Card
            {...c}
            faceDown={opponent}
            key={cardToId(c.suit, c.value, c.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default Hand
