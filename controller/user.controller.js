// const { ObjectId } = require('mongoose').Types
const User = require('../model/user.model')
const Phonebook = require('../model/phonebook.model')
const ChatRoom = require('../model/chatRoom.model')
const Media = require('../model/media.model')
const cld = require('../cloudinary')



module.exports = {
    addContacts: async (req, res) => {
        const contacts = req.body
        const resPayload = {}
        const userId = req.userId

        // Get user
        const user = await User.findById(userId).select('_id phone')

        const contactsPhoneNumber = contacts.map(c => (c.phone.number))
        // Create chatrooms
        let insertRoomsInput = contactsPhoneNumber.map(phoneNumber => {
            const chatroom = {
                roomType: 'pair',
                usersPhoneNumber: [user.phone.number, phoneNumber]
            }
            return chatroom
        })
        // Find existing pair chatrooms
        let findRoomsInput = insertRoomsInput.map(doc => {
            const docCopy = structuredClone(doc)
            docCopy.usersPhoneNumber = { $all: doc.usersPhoneNumber }
            return docCopy
        })
        let rooms = await ChatRoom.find({ $or: findRoomsInput })
        if (rooms.length > 0) {
            let roomI, op
            insertRoomsInput = insertRoomsInput.filter(doc => {
                roomI = rooms.findIndex(room => {
                    return room.usersPhoneNumber.includes(doc.usersPhoneNumber[0]) && room.usersPhoneNumber.includes(doc.usersPhoneNumber[1])
                })
                roomI === -1 ? op = true : op = false
                return op
            })
        }

        let newRooms
        ChatRoom.insertMany(insertRoomsInput, (err, docs) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }
            newRooms = docs
        })
        // Fetch user phonebook
        let phonebook = await Phonebook.findOne({ user: user._id })
        // Filter out already saved contacts
        let newContacts = contacts
        phonebook.contacts.forEach((phonebookContact) => {
            newContacts = newContacts.filter((c) => {
                return c.phone.number !== phonebookContact.phone.number
            })
        })

        if (newContacts.length === 0) {
            resPayload.msg = 'success'
            return res.json(resPayload)
        }
        // Mapout phone from new contacts
        const newContactsPhone = newContacts.map(c => ({phone: c.phone}))
        // Find existing users with phones in new contacts
        const existingUsers = await User.find({ $or: newContactsPhone }).select('phone _id')
        // Mapout phone number from existing users of new contacts 
        const existingUsersPhoneNumber = existingUsers.map((user) => user.phone.number)

        // Tag contacts with existing users
        existingUsers.forEach((user) => {
            const contactIndex = newContacts.findIndex((c) => c.phone.number === user.phone.number)
            if (existingUsersPhoneNumber.includes(user.phone.number)) {
                newContacts[contactIndex].userAccExist = true
                newContacts[contactIndex].user = user._id
            }
        })

        // Add room id to new contacts
        let room
        newContacts = newContacts.map(c => {
            room = newRooms.find(room => {
                return room.usersPhoneNumber.includes(c.phone.number)
            })
            if (room !== undefined) {
                c.roomId = room.id
            }
            return c
        })

        // Save phonebook
        phonebook.contacts.push(...newContacts)
        phonebook.save(async (err, doc) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }

            resPayload.msg = 'success'
            // resPayload.data = doc
            res.json(resPayload)
        })
    },
    
    assignContactsToRooms: async (req, res) => {
        const { contacts } = req.body
        const userId = req.userId
        const resPayload = {}

        // Fetch user
        const user = await User.findById(userId).select('_id phone')

        const contactsPhoneNumber = contacts.map(c => (c.phone.number))
        // Create chatrooms
        let insertRoomsInput = contactsPhoneNumber.map(phoneNumber => {
            const chatroom = {
                roomType: 'pair',
                usersPhoneNumber: [user.phone.number, phoneNumber]
            }
            return chatroom
        })
        // Find existing pair chatrooms
        const findRoomsInput = insertRoomsInput.map(doc => {
            const docCopy = structuredClone(doc)
            docCopy.usersPhoneNumber = { $all: doc.usersPhoneNumber }
            return docCopy
        })
        const existingRooms = await ChatRoom.find({ $or: findRoomsInput })
        if (existingRooms.length > 0) {
            let roomI, op
            insertRoomsInput = insertRoomsInput.filter(doc => {
                roomI = existingRooms.findIndex(room => {
                    return room.usersPhoneNumber.includes(doc.usersPhoneNumber[0]) && room.usersPhoneNumber.includes(doc.usersPhoneNumber[1])
                })
                roomI === -1 ? op = true : op = false
                return op
            })
        }

        ChatRoom.insertMany(insertRoomsInput, async (err, docs) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }
            // console.log({insertRoomsInput, docs});
            const newRooms = docs
            // console.log({existingRooms, newRooms});
            const rooms = [...existingRooms, ...newRooms]
            // resPayload.msg = 'success'
            // res.json(resPayload)
            // Add room id to new contacts
            let assignedContacts = []
            let phonebook = await Phonebook.findOne({ user: user._id })
            let room
            phonebook.contacts.forEach((phonebookContact) => {
                const phonebookContactPhoneNumber = phonebookContact.phone.number
                if (contactsPhoneNumber.includes(phonebookContactPhoneNumber)) {
                    room = rooms.find(r => { 
                        const roomUsersPhoneNumber = r.usersPhoneNumber
                        return roomUsersPhoneNumber.includes(phonebookContactPhoneNumber)
                    })
                    // console.log({room});
                    if (room !== undefined) {
                        phonebookContact.roomId = room.id
                        assignedContacts.push(phonebookContact)
                    }
                }
            })

            phonebook.save(async (err) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
    
                resPayload.msg = 'success'
                resPayload.data = assignedContacts
                res.json(resPayload)
            })
        })
    },

    deleteContacts: async (req, res) => {
        const removeContacts = req.body
        const resPayload = {}
        const userId = req.userId

        // Fetch user _id
        // const user = await User.findById(userId).select('_id')
        let phonebook = await Phonebook.findOne({ user: userId })

        const removeContactsPhoneNumber = removeContacts.map(c => c.phone.number)
        phonebook.contacts = phonebook.contacts.filter(c => {
            return !removeContactsPhoneNumber.includes(c.phone.number)
        })
        
        phonebook.save(async (err) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }
            resPayload.msg = 'success'
            res.json(resPayload)
        })
    },

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

    getPhonebook: async (req, res) => {
        const resPayload = {}
        const { userId } = req
        let phonebook = await Phonebook.findOne({ user: userId })
        if (!phonebook) {
            const newPhonebook = new Phonebook({
                user: userId
            })
            await newPhonebook.save((err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
                phonebook = doc
            })
        }

        // Check contacts with existing acc
        let notExistingUserAccPhones = phonebook.contacts.map(contact => {
            return !contact.userAccExist ? contact.phone : null
        }).filter(phoneNumber => phoneNumber !== null)
        let query = notExistingUserAccPhones.map(phone => ({ phone }))
        const newExistingUsers = await User.find({ $or: query }).select('_id phone')
        const newExistingUsersPhoneNumber = newExistingUsers.map(user => user.phone.number)
        if (newExistingUsers.length > 0) {
            phonebook.contacts.forEach(contact => {
                if (newExistingUsersPhoneNumber.includes(contact.phone.number)) {
                    contact.userAccExist = true
                    const user = newExistingUsers.find(user => user.phone.number === contact.phone.number)
                    if (user) contact.user = user._id
                }
            })
            await phonebook.save((err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
                phonebook = doc
            })
        }
        
        // Send response
        resPayload.msg = 'ok'
        await phonebook.populate('contacts.user')
        resPayload.data = await phonebook.populate('contacts.user.avatar')
        res.json(resPayload)
    },

    updateUser: async (req, res) => {
        const resPayload = {}
        const { data } = req.body

        if (data.avatar) {
            const cldRes = await cld.upload(data.avatar)
            // console.log('cldRes:', cldRes)
            const thumb_url = await cld.scaleImage(cldRes.public_id)
            // console.log('thumb_url:', thumb_url)
            const newMedia = new Media({
                url: cldRes.secure_url,
                thumb_url,
                storageId: cldRes.public_id,
                type: 'image'
            })
            await newMedia.save(async (err, media) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }

                data.avatar = media._id
                console.log({ data });
                User.findByIdAndUpdate(req.userId, { $set: data }, { new: true }, async (err, doc) => {
                    if (err) {
                        resPayload.msg = 'error'
                        resPayload.from = 'Mongodb'
                        return res.json(resPayload)
                    }
            
                    resPayload.data = await doc.populate('avatar')
                    resPayload.msg = 'success'
                    res.json(resPayload)
                })
            })
        } else {
            User.findByIdAndUpdate(req.userId, { $set: data }, { new: true }, async (err, doc) => {
                /* if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    return res.json(resPayload)
                } */
        
                resPayload.data = await doc.populate('avatar')
                resPayload.msg = 'success'
                res.json(resPayload)
            })
        }
    }
    
    /* userFetchUsers: async (req, res) => {
        const resPayload = {}
        const usersId = req.query.ids
                            .split(',')
                            .map(id => ({_id: id}))
                            
        const users = await User.find({ $or: usersId }).populate('avatar')

        resPayload.msg = 'ok'
        resPayload.data = users
        res.json(resPayload)
    } */
}