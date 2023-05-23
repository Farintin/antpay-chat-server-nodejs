require('dotenv').config()
const express = require('express')
const cors = require("cors");
const config = require('./config')
require('./db')
const routes = require("./routes/v1");



const app = express()
app.use(express.json())
app.use(cors())


app.use("/v1", routes)


const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))


const io = require('socket.io')(server)
io.on('connection', onConnected)
let socketsConected = new Set()

function onConnected(socket) {
  console.log('Socket connected', socket.id)
  socketsConected.add(socket.id)


  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketsConected.delete(socket.id)
  })


  socket.on('messageFromUser', (data) => {
    // console.log(data)
    socket.broadcast.emit('messageToUser', data)
  })
}