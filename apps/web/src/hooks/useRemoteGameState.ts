import { useRef } from "react"
import RemoteEngine from "../utils/engines/RemoteEngine"
import { socket } from "../utils/socket"
import useGameState from "./useGameState"

function useRemoteGameState(id: string) {
  const engine = useRef(new RemoteEngine(socket))

  return useGameState(id, engine)
}

export default useRemoteGameState
