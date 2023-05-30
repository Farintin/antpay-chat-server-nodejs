const User = require('../model/user.model')
const Phonebook = require('../model/phonebook.model')



module.exports = {
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
            resPayload.data = await doc.populate('avatar contacts.user contacts.user.avatar')
            res.json(resPayload)
        })
    },
    
    updateUser: async (req, res) => {
        const resPayload = {}

        const doc = await User.findByIdAndUpdate(req.userId, { $set: req.body })
        if (!doc) {
            resPayload.msg = 'error'
            resPayload.from = 'Mongodb'
            return res.json(resPayload)
        }
        resPayload.msg = 'success'
        res.json(resPayload)
    },
    
    addContacts: async (req, res) => {
        const contacts = req.body
        const resPayload = {}
        const userId = req.userId

        // Fetch user _id
        const user = await User.findById(userId).select('_id')
        // Check if user phonebook already create else create one
        let phonebook = await Phonebook.findOne({ user: user._id })
        if (!phonebook) {
            const newPhonebook = new Phonebook({
                user: user._id
            })
            await newPhonebook.save()
            phonebook = newPhonebook
        }

        // Filter out already had contacts
        let newContacts = contacts
        // console.log('newContacts1:', newContacts);
        phonebook.contacts.forEach((pbc) => {
            newContacts = newContacts.filter((c) => {
                // console.log('###');
                // console.log('pbc.phone.number:', pbc.phone.number);
                // console.log('c.phone.number:', c.phone.number);
                // console.log('###');
                return c.phone.number !== pbc.phone.number
            })
        })
        // console.log('newContacts3:', newContacts);

        if (newContacts.length === 0) {
            resPayload.msg = 'success'
            return res.json(resPayload)
        }

        // Mapout phone from new contacts
        const newContactsPhone = newContacts.map((c) => {
            return {phone: c.phone}
        })
        // console.log('newContactsPhone:', newContactsPhone);
        // Find existing users with phones in new contacts
        const existingUsers = await User.find({ $or: newContactsPhone }).select('phone _id')
        // Mapout phone number from existing users of new contacts 
        const existingUsersPhoneNumber = existingUsers.map((user) => user.phone.number)

        // Tag contacts with existing users
        existingUsers.forEach((user) => {
            const contactIndex = newContacts.findIndex((c) => c.phone.number === user.phone.number)
            if (existingUsersPhoneNumber.includes(user.phone.number)) {
                newContacts[contactIndex].userAccExist = true
                newContacts[contactIndex].userId = user.id
            }
        })

        phonebook.contacts.push(...newContacts)
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
    }
}