const express = require('express')
const authRoute = require('./auth.route')
const mediaRoute = require('./media.route')
const userRoute = require('./user.route')
const chatroomRoute = require('./chatroom.route')



const router = express.Router()

router.use('/auth', authRoute)
router.use('/media', mediaRoute)
router.use('/users', userRoute)
router.use('/rooms', chatroomRoute)



module.exports = router