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
    console.log(hand)

    return (
        <div ref={ref} className="hand">
            {hand.map((c) => (
                <div className="card-in-hand">
                    <Card {...c} key={cardToId(c.suit, c.value)}/>
                </div>
            ))}
        </div>
    )
}

export default Hand
