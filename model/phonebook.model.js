const mongoose = require('mongoose')



const Schema = mongoose.Schema
const phonebookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    contacts: [
        {
            entry: {
                type: String,
                default: 'app'
            },
            userAccExist: {
                type: Boolean,
                default: false
            },
            phone: {
                countryName: {
                    type: String,
                    trim: true,
                    required: true
                },
                countryCode: {
                    type: String,
                    trim: true,
                    required: true
                },
                number: {
                    type: String,
                    trim: true,
                    required: true
                }
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            roomId: String
        }
    ]
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const Phonebook = mongoose.model('Phonebook', phonebookSchema)



module.exports = Phonebook