import { RemoteAI } from "@repo/core/ai"
import { CoreEngine } from "@repo/core/engine"
import { MersenneTwister19937, Random } from "random-js"
import { useEffect, useRef } from "react"
import { socket } from "../utils/socket"
import useGameState from "./useGameState"

function useRemoteAIGameState(id: string) {
  const engine = useRef(
    new CoreEngine(id, "CPU", new Random(MersenneTwister19937.seed(0))),
  )

  useEffect(() => {
    const ai = new RemoteAI("CPU", socket, engine.current)
    ai.register()
    engine.current.register("CPU", ai)

    socket.on("connect", () => {
      engine.current.ready("CPU")
    })

    return () => ai.deregister()
  }, [])

  return useGameState(id, engine)
}

export default useRemoteAIGameState
