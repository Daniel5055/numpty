import type { PropsWithChildren } from "react"
import GameStateContext from "../contexts/GameStateContext"
import useRemoteGameState from "../hooks/useRemoteGameState"

interface RemotePlayerProps extends PropsWithChildren {
  url: string
}

function RemotePlayer({ children, url }: RemotePlayerProps) {
  const state = useRemoteGameState("Human", url)

  return <GameStateContext value={state}>{children}</GameStateContext>
}

export default RemotePlayer
