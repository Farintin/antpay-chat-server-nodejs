// const { ObjectId } = require('mongoose').Types
const User = require('../model/user.model')
const Phonebook = require('../model/phonebook.model')
const ChatRoom = require('../model/chatRoom.model')
const Media = require('../model/media.model')
const cld = require('../cloudinary')




function compareArrays(arr1, arr2){
    if(arr1.length !== arr2.length) return false

    if(arr1.sort().toString() !== arr2.sort().toString()) return false
  
    return true
}



module.exports = {
    addContacts: async (req, res) => {
        let contactsPhones = req.body
        const resPayload = {}
        const userId = req.userId

        // Get user
        const user = await User.findById(userId).select('_id phone')

        // Find existing pair chatrooms, Create chatrooms
        const contactsPhoneNumber = contactsPhones.map(c => c.phone.number)
        let roomsQ = contactsPhoneNumber.map(phoneNumber => {
            const chatroom = {
                roomType: 'pair',
                usersPhoneNumber: { $all: [user.phone.number, phoneNumber] }
            }
            return chatroom
        })

        // Find existing rooms
        const existingRooms = await ChatRoom.find({ $or: roomsQ })
        roomsQ = roomsQ.map(q => {
            q.usersPhoneNumber = q.usersPhoneNumber.$all
            return q
        })
        roomsQ = roomsQ.filter(q => {
            let bool = true
            const room = existingRooms.find(r => compareArrays(r.usersPhoneNumber, q.usersPhoneNumber))
            if (room) bool = false
            return bool
        })
        
        await ChatRoom.insertMany(roomsQ, async (err, docs) => {
            if (err) {
                resPayload.msg = 'error'
                resPayload.from = 'Mongodb'
                resPayload.data = err
                return res.json(resPayload)
            }

            let rooms = docs
            if (rooms.length === 0) rooms = existingRooms

            const existingUsers = await User.find({ $or: contactsPhones })
                                    .select('phone _id')

            // Tag contacts with existing users
            existingUsers.forEach((u) => {
                const i = contactsPhones
                            .findIndex((c) => c.phone.number === u.phone.number)
                if (i !== -1) {
                    contactsPhones[i].userAccExist = true
                    contactsPhones[i].user = u._id
                }
            })

            // Add room id to new contacts
            const contacts = contactsPhones.map(c => {
                let room = rooms.find(room => {
                    return room.usersPhoneNumber.includes(c.phone.number)
                })
                if (room !== undefined) {
                    c.roomId = room.id
                }
                return c
            })

            // Fetch, add contacts and save phonebook
            const phonebook = await Phonebook.findOne({ user: user._id })

            phonebook.contacts.push(...contacts)
            phonebook.save(async (err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
    
                resPayload.msg = 'success'
                resPayload.data = doc
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
        console.log({ phonebook });
        if (phonebook) {
            console.log('phonebook exist');
            // Search for existing users in contacts
            let contactsPhones = phonebook.contacts.map(c => c.phone)
            let existingUsers = []
            if (contactsPhones.length > 0) {
                const query = contactsPhones.map(phone => ({ phone }))
                existingUsers = await User.find({ $or: query }).select('_id phone')
            }

            if (existingUsers.length > 0) {
                const existingUsersPhoneNumber = existingUsers.map(u => u.phone.number)
                phonebook.contacts.forEach(c => {
                    const cpn = c.phone.number
                    if (existingUsersPhoneNumber.includes(cpn)) {
                        c.userAccExist = true
                        const u = existingUsers.find(u => u.phone.number === cpn)
                        c.user = u._id
                    }
                })

                phonebook.save(async (err, doc) => {
                    if (err) {
                        resPayload.msg = 'error'
                        resPayload.from = 'Mongodb'
                        resPayload.data = err
                        return res.json(resPayload)
                    }
                    phonebook = doc
                    // Send response
                    resPayload.msg = 'ok'
                    await phonebook.populate('contacts.user')
                    resPayload.data = await phonebook.populate('contacts.user.avatar')
                    res.json(resPayload)
                })
            } else {
                // Send response
                resPayload.msg = 'ok'
                await phonebook.populate('contacts.user')
                resPayload.data = await phonebook.populate('contacts.user.avatar')
                res.json(resPayload)
            }
        } else {
            console.log('create phonebook');
            const newPhonebook = new Phonebook({
                user: userId
            })

            newPhonebook.save(async (err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
                phonebook = doc
                // Send response
                resPayload.msg = 'ok'
                await phonebook.populate('contacts.user')
                resPayload.data = await phonebook.populate('contacts.user.avatar')
                res.json(resPayload)
            })
        }
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
}