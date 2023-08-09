const express = require('express')
const { jwtAuthHandler } = require('../../handler/jwt')
const Controller = require('../../controller/user.controller')


/* 
const use = fn => (req, res, next) => 
    Promise.resolve(fn(req, res, next)).catch(next) 
*/

const router = express.Router()

router.get('/user', jwtAuthHandler, Controller.getUserData)
router.get('/user/phonebook', jwtAuthHandler, Controller.getPhonebook)
router.put('/user/update', jwtAuthHandler, Controller.updateUser)
router.put('/user/addContacts', jwtAuthHandler, Controller.addContacts)
router.put('/user/deleteContacts', jwtAuthHandler, Controller.deleteContacts)



module.exports = router