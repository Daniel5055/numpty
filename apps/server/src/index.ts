import { Server as Engine } from "@socket.io/bun-engine"
import Bun from "bun"
import { Server } from "socket.io"
import { Game } from "./game"

const io = new Server()

const eng = new Engine({
  path: "/socket.io/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

io.bind(eng)

//console.log('hello world')

new Game(io)

io.on("connection_error", (err) => {
  console.log(err)
})

Bun.serve({
  port: 3000,
  ...eng.handler(),
})
