const { Server } = require("socket.io")
const { onConnectedSocket } = require('./handlers/io')



module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://web.localhost:3000",
      methods: ["GET","POST"]
    }
  })
  io.on('connection', (socket) => onConnectedSocket(socket, io))
}