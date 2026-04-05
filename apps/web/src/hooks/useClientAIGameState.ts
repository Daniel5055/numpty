import { SimpleAi } from "@repo/core/ai"
import { CoreEngine } from "@repo/core/engine"
import { Random } from "random-js"
import { useEffect, useRef } from "react"
import useGameState from "./useGameState"

function useClientAIGameState(id: string) {
  const engine = useRef(new CoreEngine(id, "CPU", new Random()))

  useEffect(() => {
    engine.current.register(
      "CPU",
      new SimpleAi("CPU", engine.current, new Random()),
    )
    engine.current.ready("CPU")
  }, [])

  return useGameState(id, engine)
}

export default useClientAIGameState
