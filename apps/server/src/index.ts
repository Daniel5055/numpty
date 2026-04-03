import { Server as Engine } from "@socket.io/bun-engine"
import Bun from "bun"
import { Server } from "socket.io"

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

io.on("connection", (socket) => {
  console.log(socket.id, "connected")

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected")
  })
  socket.emit("hello")
})

io.on("connection_error", (err) => {
  console.log(err)
})

Bun.serve({
  port: 3000,
  ...eng.handler(),
})
