import { useDraggable } from "@dnd-kit/react"
import { cardToFile, cardToId, type ICard } from "@repo/core/card"
import { motion } from "framer-motion"
import { useState } from "react"

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

  const [animated, setAnimated] = useState(false)

  return (
    <motion.div
      className={`card ${animated ? "animated" : ""} ${faceDown ? "face-down" : ""}`}
      ref={ref}
      layoutId={cardToId(suit, value, id)}
      layout
      id={cardToId(suit, value, id)}
      onLayoutAnimationStart={() => {
        setAnimated(true)
      }}
      onLayoutAnimationComplete={() => {
        setAnimated(false)
      }}
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
