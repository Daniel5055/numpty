import { useDroppable } from "@dnd-kit/react";
import { boardId, stackToId, type ICard } from "../utils/card";
import Stack from "./Stack";

interface BoardProps {
    board: [ICard, ICard?][]
    droppable?: boolean
    attacking: boolean
}

function Board({ board, droppable = true, attacking }: BoardProps) {
    const {ref} = useDroppable({
        id: boardId,
        disabled: !droppable
    })

    return (
        <div ref={ref} className="board">
            {board.map(([a, d]) => <Stack attack={a} defence={d} key={stackToId(a)} attacking={attacking} />)}
        </div>
    )
}

export default Board
