import type { Board, ICard } from "@repo/core/card"
import { CoreEngine } from "@repo/core/engine"
import type { WebEngine } from "./WebEngine"

export class ClientEngine extends CoreEngine implements WebEngine {
  public get trumpCard(): ICard {
    if (!this._trumpCard) {
      throw Error("Cannot get trump before start")
    }

    return this._trumpCard
  }

  public attacker() {
    return this._attacker
  }

  public hand(player: string): ICard[] {
    return this.hands[player]
  }

  public board(): Board {
    return this._board
  }
}
