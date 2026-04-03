import { useState } from "react"
import "./App.css"
import Game from "./components/Game"
import { mkClientEngine } from "./utils/engines/client"

function App() {
  const [count, setCount] = useState(0)

  function restart() {
    setCount((c) => c + 1)
  }

  return <Game mkEngine={mkClientEngine} playAgain={restart} key={count} />
}

export default App
