import { useDraggable} from "@dnd-kit/react"
import { cardToFile, cardToId } from "../utils/card"

interface CardProps {
    suit: string
    value: string
}

function Card({suit, value}: CardProps) {
    const {ref} = useDraggable({
        id: cardToId(suit, value)
    })

    return (
        <div className="card" ref={ref}>
            <img src={`/cards/${cardToFile(suit, value)}`} alt={cardToId(suit, value)} />
        </div>
    )
}

export default Card
