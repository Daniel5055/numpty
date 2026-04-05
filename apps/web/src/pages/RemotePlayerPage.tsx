import { useState } from "react"
import Game from "../components/Game"
import RemotePlayer from "../components/RemotePlayer"

function RemotePlayerPage() {
  const [count, setCount] = useState(0)

  return (
    <RemotePlayer url={"http://localhost:3000"}>
      <Game playAgain={() => setCount((c) => c + 1)} key={count} />
    </RemotePlayer>
  )
}

export default RemotePlayerPage
