import { useState } from "react"
import Game from "../../components/Game"
import RemoteAI from "../../components/RemoteAI"

function RemoteAIPage() {
  const [, setCount] = useState(0)

  return (
    <RemoteAI>
      <Game playAgain={() => setCount((c) => c + 1)} />
    </RemoteAI>
  )
}

export default RemoteAIPage
