import type { ICard } from "@repo/core/card"
import type { Engine, Handlers } from "@repo/core/engine"
import { RECV_PROTOCOL, SEND_PROTOCOL } from "@repo/core/protocol"
import type { Socket } from "socket.io-client"

class RemoteAI implements Handlers {
  socket: Socket
  engine: Engine
  id: string

  constructor(id: string, socket: Socket, engine: Engine) {
    this.socket = socket
    this.engine = engine
    this.id = id
  }

  register() {
    this.socket.on(SEND_PROTOCOL.Attack, (card) =>
      this.engine.attack(this.id, card),
    )
    this.socket.on(SEND_PROTOCOL.Defend, (card, against) =>
      this.engine.defend(this.id, card, against),
    )
    this.socket.on(SEND_PROTOCOL.Reverse, (card) =>
      this.engine.reverse(this.id, card),
    )
    this.socket.on(SEND_PROTOCOL.Concede, () => this.engine.concede(this.id))
    this.socket.on(SEND_PROTOCOL.Finish, () => this.engine.finish(this.id))
    this.socket.on(SEND_PROTOCOL.Grant, (cards) =>
      this.engine.grant(this.id, cards),
    )
  }

  deregister() {
    this.socket.off(SEND_PROTOCOL.Attack)
    this.socket.off(SEND_PROTOCOL.Defend)
    this.socket.off(SEND_PROTOCOL.Reverse)
    this.socket.off(SEND_PROTOCOL.Concede)
    this.socket.off(SEND_PROTOCOL.Finish)
    this.socket.off(SEND_PROTOCOL.Grant)
  }

  attacked(card: ICard) {
    this.socket.emit(RECV_PROTOCOL.Attacked, card)
  }
  defended(card: ICard, against: ICard) {
    this.socket.emit(RECV_PROTOCOL.Defended, card, against)
  }
  reversed(card: ICard) {
    this.socket.emit(RECV_PROTOCOL.Reversed, card)
  }
  conceded() {
    this.socket.emit(RECV_PROTOCOL.Conceded)
  }
  finished() {
    this.socket.emit(RECV_PROTOCOL.Conceded)
  }
  granted(cards: ICard[]) {
    this.socket.emit(RECV_PROTOCOL.Granted, cards)
  }
  gameStart(attacking: boolean, trumpCard: ICard, deck: ICard[]) {
    this.socket.emit(RECV_PROTOCOL.Started, attacking, trumpCard, deck)
  }
  gameEnd(win: boolean) {
    this.socket.emit(RECV_PROTOCOL.Endeded, win)
  }
  drawn(cards: ICard[], opDrawn: number, first: boolean, trump?: ICard) {
    this.socket.emit(RECV_PROTOCOL.Drawn, cards, opDrawn, first, trump)
  }
}

export default RemoteAI
