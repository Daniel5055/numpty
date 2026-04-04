import type { ICard } from "@repo/core/card"
import type { Engine, Handlers } from "@repo/core/engine"
import { RECV_PROTOCOL, SEND_PROTOCOL } from "@repo/core/protocol"

class RemoteEngine implements Engine {
  socket: any

  constructor(socket: any) {
    this.socket = socket
  }

  ready(_: string) {
    //
  }

  attack(_: string, card: ICard): void {
    this.socket.emit(SEND_PROTOCOL.Attack, card)
  }
  defend(_: string, card: ICard, against: ICard) {
    this.socket.emit(SEND_PROTOCOL.Defend, card, against)
  }
  reverse(_: string, card: ICard) {
    this.socket.emit(SEND_PROTOCOL.Reverse, card)
  }
  concede(_: string) {
    this.socket.emit(SEND_PROTOCOL.Concede)
  }
  finish(_: string) {
    this.socket.emit(SEND_PROTOCOL.Finish)
  }
  grant(_: string, cards: ICard[]) {
    this.socket.emit(SEND_PROTOCOL.Grant, cards)
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

  deregister(_: string) {
    this.socket.off(RECV_PROTOCOL.Attacked)
    this.socket.off(RECV_PROTOCOL.Defended)
    this.socket.off(RECV_PROTOCOL.Reversed)
    this.socket.off(RECV_PROTOCOL.Conceded)
    this.socket.off(RECV_PROTOCOL.Finished)
    this.socket.off(RECV_PROTOCOL.Granted)
    this.socket.off(RECV_PROTOCOL.Drawn)
    this.socket.off(RECV_PROTOCOL.Started)
    this.socket.off(RECV_PROTOCOL.Endeded)
  }
}

export default RemoteEngine
