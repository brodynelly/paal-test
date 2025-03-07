import { io } from 'socket.io-client'

const SOCKET_URL = `http://localhost:8080`

export const socket = io(SOCKET_URL, {
  path: "/socket.io",
  transports: ['websocket'],
  autoConnect: true
})

export const subscribeToStats = (callback: (stats: any) => void) => {
  socket.on('stats_update', callback)
  return () => {
    socket.off('stats_update', callback)
  }
}

export const subscribeToDevices = (callback: (devices: any) => void) => {
  socket.on('devices_update', callback)
  return () => {
    socket.off('devices_update', callback)
  }
}

export const subscribeToPigs = (callback: (pigs: any) => void) => {
  socket.on('pigs_update', callback)
  return () => {
    socket.off('pigs_update', callback)
  }
}
