import { useDroppable } from "@dnd-kit/react";
import { boardId, stackToId, type ICard } from "../utils/card";
import Stack from "./Stack";

interface BoardProps {
    board: [ICard, ICard?][]
    attacking: boolean
}

function Board({ board, attacking }: BoardProps) {
    const {ref} = useDroppable({
        id: boardId,
        disabled: !attacking
    })

    return (
        <div ref={ref} className="board">
            {board.map(([a, d]) => <Stack attack={a} defence={d} key={stackToId(a)} />)}
        </div>
    )
}

export default Board
