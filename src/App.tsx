import './App.css'
import Game from "./components/Game"
import { mkClientEngine } from "./utils/engines/client"

function App() {
  return <Game mkEngine={mkClientEngine} />
}

export default App
