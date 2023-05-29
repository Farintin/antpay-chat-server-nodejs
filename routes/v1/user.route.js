const express = require('express')
const { jwtAuthHandler } = require('../../handler/jwt')
const Controller = require('../../controller/user.controller')



const router = express.Router()

router.get('/user', jwtAuthHandler, Controller.getUserData)

router.put('/user/update', jwtAuthHandler, Controller.updateUser)



module.exports = router