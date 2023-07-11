const mongoose = require('mongoose')



const Schema = mongoose.Schema
const chatRoomSchema = new Schema({
    // use db auto generated id field
    roomType: {
        type: String, 
        default: 'pair'
    },
    usersPhoneNumber: [String],
    messages: [{
        sid: String,
        roomId: String,
        author: String,
        reader: String,
        readers: [{
            userId: String,
            userPhoneNumber: String
        }],
        text: String,
        media: String,
        reciept: Number,
        time: String
    }]
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)



module.exports = ChatRoom