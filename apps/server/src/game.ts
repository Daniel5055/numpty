import { CoreEngine, defaultHandlers, type Handlers } from "@repo/core/engine"
import { RECV_PROTOCOL, SEND_PROTOCOL } from "@repo/core/protocol"
import { MersenneTwister19937, Random } from "random-js"
import type { Server } from "socket.io"

export class Game {
  id1: string | null = null
  id2: string | null = null

  handlers: Record<string, Handlers> = {}

  server: Server

  engine: CoreEngine | null = null

  constructor(socketServer: Server) {
    this.server = socketServer

    socketServer.on("connection", (socket) => {
      if (this.id1 === null) {
        console.log(socket.id, "connected as p1")
        this.id1 = socket.id
      } else if (this.id2 === null) {
        console.log(socket.id, "connected as p2")
        this.id2 = socket.id
      } else {
        socket.disconnect()
        console.log(socket.id, "disconnected (game full)")
        return
      }

      this.handlers[socket.id] = {
        attacked: (card) => socket.emit(RECV_PROTOCOL.Attacked, card),
        defended: (card, against) =>
          socket.emit(RECV_PROTOCOL.Defended, card, against),
        reversed: (card) => socket.emit(RECV_PROTOCOL.Reversed, card),
        conceded: () => socket.emit(RECV_PROTOCOL.Conceded),
        finished: () => socket.emit(RECV_PROTOCOL.Finished),
        granted: (cards) => socket.emit(RECV_PROTOCOL.Granted, cards),
        drawn: (cards, opDrawn, first, trump) =>
          socket.emit(RECV_PROTOCOL.Drawn, cards, opDrawn, first, trump),
        gameStart: (attacker, trump, deck) => {
          socket.emit(RECV_PROTOCOL.Started, attacker, trump, deck)
        },
        gameEnd: (win) => socket.emit(RECV_PROTOCOL.Endeded, win),
      }

      socket.on(SEND_PROTOCOL.Attack, (card) => {
        this.engine?.attack(socket.id, card)
      })
      socket.on(SEND_PROTOCOL.Defend, (card, against) => {
        this.engine?.defend(socket.id, card, against)
      })
      socket.on(SEND_PROTOCOL.Reverse, (card) => {
        this.engine?.reverse(socket.id, card)
      })
      socket.on(SEND_PROTOCOL.Concede, () => {
        this.engine?.concede(socket.id)
      })
      socket.on(SEND_PROTOCOL.Finish, () => {
        this.engine?.finish(socket.id)
      })
      socket.on(SEND_PROTOCOL.Grant, (card) => {
        this.engine?.grant(socket.id, card)
      })

      if (this.id1 !== null && this.id2 !== null) {
        this.start(this.id1, this.id2)
      }
    })
  }

  start(id1: string, id2: string) {
    this.engine = new CoreEngine(id1, id2, new Random())
    this.engine.register(id1, this.handlers[id1] ?? defaultHandlers)
    this.engine.register(id2, this.handlers[id2] ?? defaultHandlers)
    this.engine.ready(id1)
    this.engine.ready(id2)
    console.log("Game start")
  }
}
