const ChatRoom = require('../model/chatRoom.model')



const chatRoomHandler = async (roomId) => {
    let room = await ChatRoom.findById(roomId)
    if (!room) {
        console.log('room does not exist')
    }
    return room
}



module.exports = {
    chatRoomHandler
}