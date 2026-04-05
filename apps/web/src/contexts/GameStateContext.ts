import { createContext } from "react"
import { type GameState } from "../utils/game"

// There should be no default value
const GameStateContext = createContext<GameState>({} as GameState)

export default GameStateContext
