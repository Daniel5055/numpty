import { useState } from "react"
import Game from "../components/Game"
import RemotePlayer from "../components/RemotePlayer"

function RemotePlayerPage() {
  const [count, setCount] = useState(0)

  return (
    <RemotePlayer url={"https://2365-51-175-70-250.ngrok-free.app"}>
      <Game playAgain={() => setCount((c) => c + 1)} key={count} />
    </RemotePlayer>
  )
}

export default RemotePlayerPage
