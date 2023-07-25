const express = require('express')
// const { jwtAuthHandler } = require('../../handler/jwt')
const Controller = require('../../controller/media.controller')



const router = express.Router()

router.post('/upload', Controller.upload)



module.exports = router