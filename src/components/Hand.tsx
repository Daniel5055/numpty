import { useDroppable } from "@dnd-kit/react";
import { cardToId, type ICard } from "../utils/card";
import Card from "./Card";

interface HandProps {
    hand: ICard[]
}

function Hand({hand}: HandProps) {
    const {ref} = useDroppable({
        id: "hand"
    })

    return (
        <div ref={ref} className="hand">
            {hand.map((c) => (
                <div className="card-in-hand" key={`hand_${cardToId(c.suit, c.value)}`}>
                    <Card {...c} />
                </div>
            ))}
        </div>
    )
}

export default Hand
