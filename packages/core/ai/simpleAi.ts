import { boardUnique, boardUnresolved, validDefence } from "@repo/core/board"
import { type ICard } from "@repo/core/card"
import type { Handlers } from "@repo/core/engine"
import { Random } from "random-js"
import type { IStateEngine } from "../engine/StateEngine"

class SimpleAi implements Handlers {
  private id: string
  private random: Random
  private engine: IStateEngine

  constructor(id: string, engine: IStateEngine, random: Random) {
    this.id = id
    this.engine = engine
    this.random = random
  }

  drawn() {
    if (this.engine.attacking(this.id)) {
      const card = this.choose(this.engine.hand(this.id))
      this.engine.attack(this.id, card)
    }
  }

  attacked(card: ICard): boolean {
    const valid = validDefence(
      card,
      this.engine.hand(this.id),
      this.engine.trumpCard.suit,
    )
    if (valid.length === 0) {
      this.engine.concede(this.id)
      return false
    } else {
      this.engine.defend(this.id, this.choose(valid), card)
      return true
    }
  }

  defended(): boolean {
    const board = this.engine.board()
    const valid = this.engine
      .hand(this.id)
      .filter((c) => boardUnique(board).includes(c.value))

    if (valid.length === 0) {
      if (boardUnresolved(board).length === 0) {
        this.engine.finish(this.id)
      }
      return false
    } else {
      this.engine.attack(this.id, this.choose(valid))
      return true
    }
  }

  reversed(card: ICard): boolean {
    const valid = this.engine
      .hand(this.id)
      .filter((c) => c.value === card.value)
    if (valid.length === 0) {
      // Handle the attacks until we can't
      const attacks = boardUnresolved(this.engine.board())
      let result = false
      for (let a = attacks[0], i = 0; i < attacks.length; a = attacks[++i]) {
        result = this.attacked(a)
        if (!result) {
          break
        }
      }
      return result
    } else {
      this.engine.reverse(this.id, this.choose(valid))
      return true
    }
  }

  conceded(): void {
    const valid = boardUnique(this.engine.board())
    const extra = this.engine
      .hand(this.id)
      .filter((c) => valid.includes(c.value))

    this.engine.grant(this.id, extra)

    const card = this.choose(this.engine.hand(this.id))
    this.engine.attack(this.id, card)
  }

  finished(): void {
    // Do nothing
  }

  granted(): void {
    // Do nothing
  }

  gameStart(): void {
    // Do nothing
  }

  gameEnd(): void {
    // Do nothing
  }

  // Choose a card randomly from set
  private choose(cards: ICard[]): ICard {
    const i = this.random.integer(0, cards.length - 1)
    return cards[i]
  }
}

export default SimpleAi
