import type { PropsWithChildren } from "react"
import GameStateContext from "../contexts/GameStateContext"
import useRemoteGameState from "../hooks/useRemoteGameState"

function RemotePlayer({ children }: PropsWithChildren) {
  const state = useRemoteGameState("Human")

  return <GameStateContext value={state}>{children}</GameStateContext>
}

export default RemotePlayer
