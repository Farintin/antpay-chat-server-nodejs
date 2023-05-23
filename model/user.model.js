const mongoose = require('mongoose')



const Schema = mongoose.Schema
const userSchema = new Schema({
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
            required: true,
            unique: true
        }
    },
    avatar: {
        type: Schema.Types.ObjectId,
        ref: 'media'
    },
    name: {
        type: String,
        trim: true,
        default: ''
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        trim: true,
        default: ''
    },
    // refreshTokens: [String],
    active: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const User = mongoose.model('User', userSchema)



module.exports = User