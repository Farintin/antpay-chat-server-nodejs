const { chatRoomHandler } = require('../../../handler/io')





let socketsId = new Set()

const pingReciept1 = ({ socket, message }) => {
    socket.emit("to-client-reciept-ping1", message)
}
const pingReciept2 = ({ socket, data }) => {
    socket.to(data.roomId).emit("to-client-reciept-ping2", data)
}
const pingReciept3 = ({ socket, data }) => {
    socket.to(data.roomId).emit("to-client-reciept-ping3", data)
}
const indicateRoomGuestOnline = ({ socket, online, handshake }) => {
    socket.rooms.forEach(roomId => {
      socket.to(roomId).emit('room-guest-online', { roomId, online, handshake })
    })
}
const onOnlineHandshake = (roomId, socket) => {
    socket.to(roomId).emit('room-guest-online-handshake', { roomId, online: true, handshake: true })
}
const onTyping = (data, socket) => {
    const { roomId } = data
    socket.to(roomId).emit('room-guest-typing', data)
}



const onConnectedSocket = (socket, io) => {
  const socketId = socket.id
  socketsId.add(socketId)
  console.log('Socket connected', socketId)

  indicateRoomGuestOnline({ socket, online: true, handshake: false })

  socket.on('disconnect', () => {onDisconnectSocket(socket)})
  socket.on('disconnecting', () => {onDisconnectingSocket(socket)})
  socket.on('join-rooms', (roomsId) => onJoinRooms(socket, roomsId))
  socket.on('send-message', (message) => onSendMessage(message, socket, io))
  socket.on('to-server-reciept-ping2', (data) => onClientRecieptPing2(data, socket))
  socket.on('to-server-reciept-ping3', (data) => onClientRecieptPing3(data, socket))
  socket.on('send-room-guest-online-handshake', (roomId) => onOnlineHandshake(roomId, socket))
  socket.on('room-user-typing', (data) => onTyping(data, socket))
}

const onDisconnectSocket = (socket) => {
    console.log('Socket disconnected', socket.id)
    socketsId.delete(socket.id)
}

const onDisconnectingSocket = (socket) => {
    indicateRoomGuestOnline({ socket, online: false, handshake: false })
}

const onJoinRooms = (socket, roomsId) => {
    roomsId.forEach(roomId => {
        socket.join(roomId)
    })

    indicateRoomGuestOnline({ socket, online: true, handshake: false })
}

const onSendMessage = async (message, socket, io) => {
    const room = await chatRoomHandler(message.roomId)
    if (room) {
        message.reciept = 1
        room.messages.push(message)
        room.save((err, room) => {
            message = room.messages.find(msg => (msg.sid === message.sid))
            socket.to(room.id).emit('recieve-message', message)
            pingReciept1({ socket, message, io })
        })
    }
}

const onClientRecieptPing2 = async (data, socket) => {
    let room = await chatRoomHandler(data.roomId)
    if (room) {
        const msgIndex = room.messages.findIndex(msg => {
            return msg.id === data._id
        })

        if (msgIndex !== -1) {
            const message = room.messages[msgIndex]
            if (message.reciept < 2) {
                message.reciept = 2
                message.sid = ''
                room.save((err) => {
                    pingReciept2({ socket, data })
                })
            }
        }
    }
}

const onClientRecieptPing3 = async (data, socket) => {
    const { roomId, messageIds } = data
    let room = await chatRoomHandler(roomId)
    if (room) {
        console.log(roomId);
        messageIds.forEach(id => {
            i = room.messages.findIndex(msg => msg.id === id)
            if (i !== -1) {
                // if (msg.reciept < 3) {
                room.messages[i].reciept = 3
                room.messages[i].sid = ''
                // }
            }
        })
        room.save((err) => {
            pingReciept3({ socket, data })
        })
    }
}
  
  

module.exports = {
    onConnectedSocket
}