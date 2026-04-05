import type { PropsWithChildren } from "react"
import GameStateContext from "../contexts/GameStateContext"
import useClientAIGameState from "../hooks/useClientAIGameState"

function ClientAI({ children }: PropsWithChildren) {
  const state = useClientAIGameState("Human")

  return <GameStateContext value={state}>{children}</GameStateContext>
}

export default ClientAI
