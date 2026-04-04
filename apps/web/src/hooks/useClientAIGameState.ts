import { SimpleAi } from "@repo/core/ai"
import { CoreEngine } from "@repo/core/engine"
import { MersenneTwister19937, Random } from "random-js"
import { useEffect, useRef } from "react"
import useGameState from "./useGameState"

function useClientAIGameState(id: string) {
  const engine = useRef(
    new CoreEngine(id, "CPU", new Random(MersenneTwister19937.seed(0))),
  )

  useEffect(() => {
    engine.current.register("CPU", new SimpleAi("CPU", engine.current))
    engine.current.ready("CPU")
  }, [])

  return useGameState(id, engine)
}

export default useClientAIGameState
