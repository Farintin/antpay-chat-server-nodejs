const express = require('express')
const { jwtAuthHandler } = require('../../handler/jwt')
const Controller = require('../../controller/user.controller')



const router = express.Router()

router.get('/user', jwtAuthHandler, Controller.getUserData)
// router.get('/user/fetchUsers', jwtAuthHandler, Controller.userFetchUsers)
router.get('/user/phonebook', jwtAuthHandler, Controller.getPhonebook)

// router.post('/user/rooms/assignContactsToRooms', jwtAuthHandler, Controller.assignContactsToRooms)

router.put('/user/update', jwtAuthHandler, Controller.updateUser)
router.put('/user/addContacts', jwtAuthHandler, Controller.addContacts)
router.put('/user/deleteContacts', jwtAuthHandler, Controller.deleteContacts)



module.exports = router