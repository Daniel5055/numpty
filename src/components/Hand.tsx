import { useDroppable } from "@dnd-kit/react";
import type { PropsWithChildren } from "react";


function Hand({children}: PropsWithChildren) {
    const {ref} = useDroppable({
        id: "hand"
    })

    return (
        <div ref={ref} style={{ width: 300, height: 600, background: 'red'}}>
            {children}
        </div>
    )
}

export default Hand
