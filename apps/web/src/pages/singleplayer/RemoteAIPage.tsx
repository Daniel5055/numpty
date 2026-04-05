import { useState } from "react"
import Game from "../../components/Game"
import RemoteAI from "../../components/RemoteAI"
import { SOCKET_KEY } from "../../utils/socket"

function RemoteAIPage() {
  const [count, setCount] = useState(0)

  const [url] = useState(localStorage.getItem(SOCKET_KEY))
  console.log(url)

  return (
    <RemoteAI url={url ?? "http://localhost:3000"}>
      <Game playAgain={() => setCount((c) => c + 1)} key={count} />
    </RemoteAI>
  )
}

export default RemoteAIPage
