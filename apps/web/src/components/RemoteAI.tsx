import type { PropsWithChildren } from "react"
import GameStateContext from "../contexts/GameStateContext"
import useRemoteAIGameState from "../hooks/useRemoteAIGameState"

interface RemoteAIProps extends PropsWithChildren {
  url: string
}

function RemoteAI({ children, url }: RemoteAIProps) {
  console.log(url)
  const state = useRemoteAIGameState("Human", url)

  return <GameStateContext value={state}>{children}</GameStateContext>
}

export default RemoteAI
