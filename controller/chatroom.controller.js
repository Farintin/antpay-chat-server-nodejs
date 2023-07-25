const User = require('../model/user.model')
const ChatRoom = require('../model/chatRoom.model')



module.exports = {
    getRooms: async (req, res) => {
        const resPayload = {}
        const findRoomsInput = req.query.ids
                            .split(',')
                            .map(id => ({ _id: id }))

        const rooms = await ChatRoom.find({ $or: findRoomsInput })
        
        resPayload.msg = 'success'
        resPayload.data = { rooms }
        res.json(resPayload)
    },
    
    getUserRooms: async (req, res) => {
        const userId = req.userId
        const resPayload = {}

        // Fetch user
        const user = await User.findById(userId).select('phone')

        const rooms = await ChatRoom.find({ usersPhoneNumber: { $all: [user.phone.number] } })
        
        resPayload.msg = 'success'
        resPayload.data = { rooms }
        res.json(resPayload)
    }
}