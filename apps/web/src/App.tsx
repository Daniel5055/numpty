import { useState } from "react"
import "./App.css"
import Game from "./components/Game"

function App() {
  const [count, setCount] = useState(0)

  function restart() {
    setCount((c) => c + 1)
  }

  return <Game engineType={"client"} playAgain={restart} key={count} />
}

export default App
