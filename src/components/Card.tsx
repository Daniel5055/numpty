import { useDraggable } from "@dnd-kit/react"
import { motion } from "framer-motion"
import { cardToFile, cardToId, type ICard } from "../utils/card"

interface CardProps extends ICard {
  faceDown?: boolean
  lock?: boolean
}

function Card({ suit, value, id, faceDown = false, lock = false }: CardProps) {
  const { ref } = useDraggable({
    id: cardToId(suit, value, id),
    data: { suit, value, id },
    disabled: faceDown || lock,
  })

  return (
    <motion.div
      className="card"
      ref={ref}
      layoutId={cardToId(suit, value, id)}
      layout
      id={cardToId(suit, value, id)}
    >
      {!faceDown ? (
        <img
          src={`/cards/${cardToFile(suit, value)}`}
          alt={cardToId(suit, value, id)}
        />
      ) : (
        <img src={`/cards/card_back.png`} alt={cardToId(suit, value, id)} />
      )}
    </motion.div>
  )
}

export default Card
