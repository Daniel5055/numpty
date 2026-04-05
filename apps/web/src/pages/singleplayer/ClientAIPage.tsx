import { useState } from "react"
import ClientAI from "../../components/ClientAI"
import Game from "../../components/Game"

function ClientAIPage() {
  const [, setCount] = useState(0)

  return (
    <ClientAI>
      <Game playAgain={() => setCount((c) => c + 1)} />
    </ClientAI>
  )
}

export default ClientAIPage
