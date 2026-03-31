import { useDraggable} from "@dnd-kit/react"
import { cardToFile, cardToId, type ICard } from "../utils/card"
import {motion} from 'framer-motion'

interface CardProps extends ICard {
    faceDown?: boolean
}

function Card({suit, value, faceDown=false}: CardProps) {
    const {ref} = useDraggable({
        id: cardToId(suit, value),
        data: {suit, value},
        disabled: faceDown
    })

    return (
        <motion.div className="card" ref={ref} layoutId={cardToId(suit, value)} layout style={{}}>
            {!faceDown
                ? <img src={`/cards/${cardToFile(suit, value)}`} alt={cardToId(suit, value)} />
                : <img src={`/cards/card_back.png`} alt={cardToId(suit, value)} />
            }
        </motion.div>
    )
}

export default Card
