import type { Board, ICard } from "@repo/core/card"
import type { Engine } from "@repo/core/engine"

// Web engine interfaces exposes more information for client to use directly
export interface WebEngine extends Engine {
  attacker: () => string
  trumpCard: ICard

  hand: (id: string) => ICard[]
  board: () => Board
}
