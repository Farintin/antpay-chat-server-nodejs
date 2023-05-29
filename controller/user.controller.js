const User = require('../model/user.model')



module.exports = {
    getUserData: async (req, res) => {
        const resPayload = {}
        User.findById(req.userId, async (err, doc) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }
            
            resPayload.msg = 'ok'
            resPayload.data = await doc.populate('avatar')
            res.json(resPayload)
        })
    },
    
    updateUser: async (req, res) => {
        // console.log('req.body:', req.body);
        const resPayload = {}

        const doc = await User.findByIdAndUpdate(req.userId, { $set: req.body })
        // console.log('doc:', doc);
        if (!doc) {
            resPayload.msg = 'error'
            resPayload.from = 'Mongodb'
            return res.json(resPayload)
        }
        resPayload.msg = 'success'
        res.json(resPayload)
    }
}