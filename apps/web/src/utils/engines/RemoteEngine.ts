import type { ICard } from "@repo/core/card"
import type { Engine, Handlers } from "@repo/core/engine"
import { Socket } from "socket.io-client"

const SEND_PROTOCOL = {
  Attack: "ATTACK",
  Defend: "DEFEND",
  Reverse: "REVERSE",
  Concede: "CONCEDE",
  Finish: "FINISH",
  Grant: "GRANT",
}

const RECV_PROTOCOL = {
  Attacked: "ATTACKED",
  Defended: "DEFENDED",
  Reversed: "REVERSED",
  Conceded: "CONCEDED",
  Finished: "FINISHED",
  Granted: "GRANTED",
  Drawn: "DRAWN",

  Started: "GAME_START",
  Endeded: "GAME_END",
}

class RemoteEngine implements Engine {
  socket: Socket

  constructor(socket: Socket) {
    this.socket = socket
  }

  start() {
    this.socket.connect()
  }

  attack(_: string, card: ICard): void {
    this.socket.emit(SEND_PROTOCOL.Attack, { card })
  }
  defend(_: string, card: ICard, against: ICard) {
    this.socket.emit(SEND_PROTOCOL.Defend, { card, against })
  }
  reverse(_: string, card: ICard) {
    this.socket.emit(SEND_PROTOCOL.Reverse, { card })
  }
  concede(_: string) {
    this.socket.emit(SEND_PROTOCOL.Concede)
  }
  finish(_: string) {
    this.socket.emit(SEND_PROTOCOL.Finish)
  }
  grant(_: string, cards: ICard[]) {
    this.socket.emit(SEND_PROTOCOL.Grant, { cards })
  }
  register(_: string, handlers: Handlers) {
    this.socket.on(RECV_PROTOCOL.Attacked, handlers.attacked)
    this.socket.on(RECV_PROTOCOL.Defended, handlers.defended)
    this.socket.on(RECV_PROTOCOL.Reversed, handlers.reversed)
    this.socket.on(RECV_PROTOCOL.Conceded, handlers.conceded)
    this.socket.on(RECV_PROTOCOL.Finished, handlers.finished)
    this.socket.on(RECV_PROTOCOL.Granted, handlers.granted)
    this.socket.on(RECV_PROTOCOL.Drawn, handlers.drawn)
    this.socket.on(RECV_PROTOCOL.Started, handlers.gameStart)
    this.socket.on(RECV_PROTOCOL.Endeded, handlers.gameEnd)
  }
}

export default RemoteEngine
