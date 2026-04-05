import { useEffect, useRef } from "react"
import RemoteEngine from "../../../../packages/core/engine/RemoteEngine"
import { socket } from "../utils/socket"
import useGameState from "./useGameState"

function useRemoteGameState(id: string, url: string) {
  useEffect(() => {
    //@ts-ignore
    socket.io.uri = url
    socket.disconnect().connect()
  }, [url])

  const engine = useRef(new RemoteEngine(socket))

  useEffect(() => {
    engine.current.ready(id)
    socket.connect()
  }, [])

  return useGameState(id, engine)
}

export default useRemoteGameState
