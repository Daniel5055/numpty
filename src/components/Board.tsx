import { useDroppable } from "@dnd-kit/react";
import type { ICard } from "../utils/card";
import Card from "./Card";

interface BoardProps {
    board: ICard[]
}

function Board({ board }: BoardProps) {
    const {ref} = useDroppable({
        id: "board"
    })

    return (
        <div ref={ref} className="board">
            {board.map((c, i) => <Card {...c} key={i}/>)}
        </div>
    )
}

export default Board
