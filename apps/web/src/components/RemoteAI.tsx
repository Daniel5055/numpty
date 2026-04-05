import type { PropsWithChildren } from "react"
import GameStateContext from "../contexts/GameStateContext"
import useRemoteAIGameState from "../hooks/useRemoteAIGameState"

function RemoteAI({ children }: PropsWithChildren) {
  const state = useRemoteAIGameState("Human")

  return <GameStateContext value={state}>{children}</GameStateContext>
}

export default RemoteAI
