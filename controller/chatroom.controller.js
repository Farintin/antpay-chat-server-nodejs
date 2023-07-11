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
    }
}