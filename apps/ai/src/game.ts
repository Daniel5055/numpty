import { SimpleAi } from "@repo/core/ai"
import {
  CoreEngine,
  defaultHandlers,
  type Handlers,
  RemoteStateEngine,
  StateEngine,
} from "@repo/core/engine"
import { RECV_PROTOCOL, SEND_PROTOCOL } from "@repo/core/protocol"
import { MersenneTwister19937, Random } from "random-js"
import type { Server } from "socket.io"

export class Game {
  ai: Handlers = defaultHandlers

  engine: RemoteStateEngine | null = null

  server: Server

  id: string | null = null

  constructor(socketServer: Server) {
    this.server = socketServer

    socketServer.on("connection", (socket) => {
      if (this.id === null) {
        this.id = socket.id
      } else {
        console.log("disconneted")
        socket.disconnect()
        return
      }
      this.engine = new RemoteStateEngine(socket)
      this.ai = new SimpleAi(
        "CPU",
        this.engine,
        new Random(MersenneTwister19937.seed(0)),
      )
      this.engine.register("CPU", this.ai)
    })
  }
}
