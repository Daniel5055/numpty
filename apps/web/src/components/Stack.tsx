import { useDroppable } from "@dnd-kit/react"
import { cardToId, type ICard, stackToId } from "../utils/card"
import Card from "./Card"

interface StackProps {
  attack: ICard
  defence?: ICard
  attacking: boolean
}

function Stack({ attack, defence, attacking }: StackProps) {
  const { ref } = useDroppable({
    id: stackToId(attack),
    disabled: defence !== undefined || attacking,
    data: attack,
  })

  return (
    <div className="stack" ref={ref}>
      <div>
        <Card
          {...attack}
          key={cardToId(attack.suit, attack.value)}
          lock={true}
        />
        {defence && (
          <Card
            {...defence}
            key={cardToId(defence.suit, defence.value)}
            lock={true}
          />
        )}
      </div>
    </div>
  )
}

export default Stack
