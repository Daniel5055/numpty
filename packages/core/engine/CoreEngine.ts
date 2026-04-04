import type { Random } from "random-js"
import { type CardValue, type ICard } from "../util/card"
import { defaultHandlers, type Handlers } from "./Engine"
import StateEngine from "./StateEngine"

class CoreEngine extends StateEngine {
  // Flags
  protected gameOver = false

  // Extra info
  protected legalAttacks: Set<CardValue> = new Set()
  protected handlers: Record<string, Handlers> = {}
  protected random: Random

  private hasWon(player: string): boolean {
    if (this.hands[player].length === 0) {
      this.gameOver = true
      return true
    } else {
      return false
    }
  }

  protected draw(id: string) {
    const { cards1, cards2, trump } = super.draw(id)

    // Trump card can only be drawn once
    this.handlers[id].drawn(
      cards1,
      cards2.length,
      true,
      trump ? this.trumpCard : undefined,
    )
    this.handlers[this.other(id)].drawn(
      cards2,
      cards1.length,
      false,
      trump ? this.trumpCard : undefined,
    )

    return { cards1, cards2, trump }
  }

  constructor(player1: string, player2: string, random: Random) {
    super(player1, player2)

    this.handlers[player1] = { ...defaultHandlers }
    this.handlers[player2] = { ...defaultHandlers }

    this.random = random

    // Shuffle the deck
    this.random.shuffle(this.deck)
  }

  ready(id: string): void {
    if (this.ready1 && this.ready2) return

    super.ready(id)

    // If both just became ready
    if (this.ready1 && this.ready2) {
      // Inform of game start
      this.handlers[this.player1].gameStart(
        this._attacker === this.player1,
        this.trumpCard,
        this.deck.slice(0),
      )
      this.handlers[this.player2].gameStart(
        this._attacker === this.player2,
        this.trumpCard,
        this.deck.slice(0),
      )

      this.draw(this._attacker)
    }
  }

  attack(player: string, card: ICard) {
    if (this.gameOver) return

    //setTimeout(() => {
    if (player !== this._attacker) {
      throw new Error("Defender cannot attack")
    }

    if (this.legalAttacks.size > 1 && !this.legalAttacks.has(card.value)) {
      console.error(card, this.legalAttacks)
      throw new Error("Not a valid attack")
    }

    super.attack(player, card)

    this.legalAttacks.add(card.value)
    this.handlers[this.other(player)].attacked(card)

    if (this.hasWon(player)) {
      this.handlers[player].gameEnd(true)
      this.handlers[this.other(player)].gameEnd(false)
    }
    //}, 100)
  }

  defend(player: string, card: ICard, against: ICard) {
    if (this.gameOver) return

    // Cannot make this with settimeout as ai can call it repeatedly
    if (player === this._attacker) {
      throw new Error("Attacker cannot defend")
    }

    super.defend(player, card, against)

    this.legalAttacks.add(card.value)
    this.handlers[this.other(player)].defended(card, against)

    if (this.hasWon(player)) {
      this.handlers[player].gameEnd(true)
      this.handlers[this.other(player)].gameEnd(false)
    }
  }

  reverse(player: string, card: ICard) {
    if (this.gameOver) return

    //setTimeout(() => {
    if (player === this._attacker) {
      throw new Error("Attacker cannot reverse")
    }

    super.reverse(player, card)

    // Notify other player
    this.handlers[this.other(player)].reversed(card)

    if (this.hasWon(player)) {
      this.handlers[player].gameEnd(true)
      this.handlers[this.other(player)].gameEnd(false)
    }
    //}, 100)
  }
  concede(player: string) {
    if (this.gameOver) return

    super.concede(player)
    this.legalAttacks.clear()

    this.handlers[this.other(player)].conceded()
  }
  finish(player: string) {
    if (this.gameOver) return

    this.legalAttacks.clear()
    super.finish(player)

    this.handlers[this.other(player)].finished()

    this.draw(player)
  }
  grant(player: string, cards: ICard[]) {
    if (this.gameOver) return

    super.grant(player, cards)

    this.handlers[this.other(player)].granted(cards)

    if (this.hasWon(player)) {
      this.handlers[player].gameEnd(true)
      this.handlers[this.other(player)].gameEnd(false)
    }
  }

  register(id: string, handlers: Handlers) {
    this.handlers[id] = handlers
  }

  deregister(id: string) {
    this.handlers[id] = defaultHandlers
  }
}

export default CoreEngine
