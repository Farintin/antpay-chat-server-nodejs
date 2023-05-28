let socketsConected = new Set()

const disconnectSocketHandler = () => {
  console.log('Socket disconnected', socket.id)
  socketsConected.delete(socket.id)
}

const sendMessageSocketHandler = (data) => {
  socket.broadcast.emit('messageToUser', data)
}

const onConnectedSocketHandler = (socket) => {
  console.log('Socket connected', socket.id)
  socketsConected.add(socket.id)

  socket.on('disconnect', disconnectSocketHandler)
  socket.on('sendMessage', sendMessageSocketHandler)
}



module.exports = (server) => {
  const io = require('socket.io')(server)
  io.on('connection', onConnectedSocketHandler)
}