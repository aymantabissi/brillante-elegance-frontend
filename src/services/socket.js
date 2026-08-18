import { io } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

let socket = null

export function getSocket() {
  if (socket) return socket

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  socket = io(SOCKET_URL, {
    auth: { token: user?.token },
    autoConnect: false,
    transports: ['polling', 'websocket'],
    upgrade: false,
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
