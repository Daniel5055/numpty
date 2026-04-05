import { useDroppable } from "@dnd-kit/react"
import { boardId, type ICard, stackToId } from "@repo/core/card"
import Stack from "./Stack"

interface BoardProps {
  board: [ICard, ICard?][]
  droppable?: boolean
  attacking: boolean
  caption: string
}

function Board({ board, droppable = true, attacking, caption }: BoardProps) {
  const { ref } = useDroppable({
    id: boardId,
    disabled: !droppable,
  })

  const boardClass = attacking ? "attack" : "defend"

  return (
    <div ref={ref} className={`board ${boardClass}`}>
      <div className="caption">{caption}</div>
      {board.map(([a, d]) => (
        <Stack
          attack={a}
          defence={d}
          key={stackToId(a)}
          attacking={attacking}
        />
      ))}
    </div>
  )
}

export default Board
