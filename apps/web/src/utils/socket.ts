import { io } from "socket.io-client"

export const SOCKET_KEY = "socket_url"

export const socket = io({ autoConnect: false })
