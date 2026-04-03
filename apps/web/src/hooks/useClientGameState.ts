import { MersenneTwister19937, Random } from "random-js"
import { useEffect, useRef } from "react"
import SimpleAi from "../utils/ai/simpleAi"
import { ClientEngine } from "../utils/engines/ClientEngine"
import useGameState from "./useGameState"

function useClientGameState(id: string) {
  const engine = useRef(
    new ClientEngine(id, "CPU", new Random(MersenneTwister19937.seed(0))),
  )

  useEffect(() => {
    engine.current.register("CPU", new SimpleAi("CPU", engine.current))
  }, [])

  return useGameState(id, engine)
}

export default useClientGameState
