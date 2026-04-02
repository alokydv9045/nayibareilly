import { io, Socket } from 'socket.io-client'
import { config } from '../constants/app.config'

let socket: Socket | null = null

export const getSocket = () => {
  if (socket) return socket
  
  // Create socket connection with intelligent URL resolution
  const url = config.socket.url
  socket = io(url, { 
    autoConnect: true,
    reconnection: config.socket.reconnection,
    reconnectionAttempts: config.socket.reconnectionAttempts,
    reconnectionDelay: config.socket.reconnectionDelay,
    reconnectionDelayMax: config.socket.reconnectionDelayMax,
  })
  return socket
}
