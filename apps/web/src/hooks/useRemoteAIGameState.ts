import { RemoteAI } from "@repo/core/ai"
import { CoreEngine } from "@repo/core/engine"
import { Random } from "random-js"
import { useEffect, useRef } from "react"
import { socket } from "../utils/socket"
import useGameState from "./useGameState"

function useRemoteAIGameState(id: string, url: string) {
  const engine = useRef(new CoreEngine(id, "CPU", new Random()))

  useEffect(() => {
    //@ts-ignore
    socket.io.uri = url
    socket.disconnect().connect()
  }, [url])

  useEffect(() => {
    const ai = new RemoteAI("CPU", socket, engine.current)
    ai.register()
    engine.current.register("CPU", ai)

    socket.on("connect", () => {
      engine.current.ready("CPU")
      console.log("AI ready")
    })

    socket.connect()

    return () => {
      socket.off("connect")
      ai.deregister()
      engine.current.deregister("CPU")
    }
  }, [])

  return useGameState(id, engine)
}

export default useRemoteAIGameState
