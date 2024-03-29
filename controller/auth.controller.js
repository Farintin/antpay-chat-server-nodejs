const randomstring = require("randomstring")
const { generateAccessToken } = require('../handler/jwt')

const User = require('../model/user.model')
const Otp = require('../model/otp.model')
const Media = require('../model/media.model')

const cld = require('../cloudinary')





module.exports = {
    phoneAuth: async (req, res) => {
        let reqBody = req.body
        let resPayload = {}
        // console.log({ reqBody });

        // clear any prev otp
        await Otp.deleteMany({ ...reqBody })
        // generate new otp pin
        const passcode = randomstring.generate({
            length: 4,
            charset: 'numeric'
        })
        // create otp
        const newOtp = new Otp({
            passcode,
            ...reqBody
        })
        newOtp.save(async (err) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }

            // console.log('otp:', doc)
            // Send otp
            resPayload.msg = 'success'
            res.json(resPayload)
        })
    },

    signup: async (req, res, next) => {
        let reqBody = req.body
        let resPayload = {data: {}}

        const { avatar } = reqBody

        const cldRes = await cld.upload(avatar)
        // console.log('cldRes:', cldRes)
        const thumb_url = await cld.scaleImage(cldRes.public_id)
        // console.log('thumb_url:', thumb_url)

        const newMedia = new Media({
            url: cldRes.secure_url,
            thumb_url,
            storageId: cldRes.public_id,
            type: 'image'
        })
        newMedia.save(async (err, mediaDoc) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }
            
            const newUser = new User({
                ...reqBody,
                avatar: mediaDoc._id
            })
            newUser.save(async (err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
                // Generate access token
                const accessToken = await generateAccessToken(doc.id)
                resPayload.data.token = {
                    accessToken
                }
                resPayload.msg = 'success'
                res.json(resPayload)
            })
        })
    },
    
    verifyOtp: async (req, res, next) => {
        let reqBody = req.body
        let resPayload = {data: {}}

        // Find otp match
        Otp.findOne(reqBody, async (err, doc) => {
            resPayload.msg = 'success'
            if (err) {
                resPayload.msg = 'error'
                resPayload.data = err
                return res.json(resPayload)
            } else if (doc === null) {
                resPayload.validOtp = false
                return res.json(resPayload)
            }

            resPayload.validOtp = true
            // Check if phone already existing with a user
            const userWithExistingPhone = await User.findOne({ phone: reqBody.phone })
            if (userWithExistingPhone) {
                resPayload.userExist = true
                // Generate access token
                const accessToken = await generateAccessToken(userWithExistingPhone.id)
                resPayload.data.token = {
                    accessToken
                }
            } else {
                resPayload.userExist = false
            }
            // Delete otp
            Otp.findByIdAndDelete(doc.id, async (err, doc) => {
                // console.log('deleted otp:', doc)
            })
            res.json(resPayload)
        })
    },
    
    getUserOtp: async (req, res, next) => {
        const { phone } = req.body
        const resPayload = {}

        // Find otp match
        Otp.find({ phone }).sort({created_at: -1}).exec(async (err, otps) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.data = err
                return res.json(resPayload)
            }

            const lastestOtp = otps[otps.length - 1]
            // console.log(lastestOtp);
            
            resPayload.msg = 'success'
            resPayload.data = lastestOtp
            res.json(resPayload)
        })
    }
}