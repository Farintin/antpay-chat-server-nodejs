const express = require('express')
const { jwtAuthHandler } = require('../../handler/jwt')
const Controller = require('../../controller/chatroom.controller')



const router = express.Router()

router.get('/', jwtAuthHandler, Controller.getRooms)
router.get('/user', jwtAuthHandler, Controller.getUserRooms)



module.exports = router