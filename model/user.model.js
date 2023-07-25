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
    /* phoneVerified: {
        type: Boolean,
        default: false
    }, */
    avatar: {
        type: Schema.Types.ObjectId,
        ref: 'Media'
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
    devices: [
        {
            mac: String,
            web: Boolean,
            webAgent: String,
            loggedOut: {
                type: Boolean,
                default: true
            },
            // accessToken: String
        }
    ],
    // refreshTokens: [String],
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

const User = mongoose.model('User', userSchema)



module.exports = User