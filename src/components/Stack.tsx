import { useDroppable } from "@dnd-kit/react"
import { cardToId, stackToId, type ICard } from "../utils/card"
import Card from "./Card"

interface StackProps {
    attack: ICard
    defence?: ICard
}

function Stack({attack, defence}: StackProps) {

    const {ref} = useDroppable({
        id: stackToId(attack),
        disabled: defence !== undefined,
        data: attack
    })


    return (
        <div className="stack" ref={ref}>
            <div>
                <Card {...attack} key={cardToId(attack.suit, attack.value)} lock={true} />
                {defence && <Card {...defence} key={cardToId(defence.suit, defence.value)} lock={true} />}
            </div>
        </div>
    )

}

export default Stack
