const mongoose = require('mongoose')



const Schema = mongoose.Schema
const otpSchema = new Schema({
    passcode: {
        type: String,
        trim: true,
        required: true
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
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
const Otp = mongoose.model('Otp', otpSchema)



module.exports = Otp