const express = require('express')
const validate = require('../../middleware/validator')
const authSchema = require('../../middleware/validator/schema/auth.schema')
const controller = require('../../controller/auth.controller')

const { refreshToken } = require('../../handler/jwt')



const router = express.Router()

router.post('/user/signup', validate(authSchema.signup), controller.signup)
router.post('/user/phoneAuth', validate(authSchema.createOtp), controller.phoneAuth)
router.post('/user/verifyOtp', validate(authSchema.verifyOtp), controller.verifyOtp)
router.post('/user/getUserOtp', controller.getUserOtp)
router.get('/user/refreshToken', refreshToken)



module.exports = router