const mongoose = require('mongoose')



const Schema = mongoose.Schema
const mediaSchema = new Schema({
    url: {
        type: String,
        trim: true,
        default: ''
    },
    thumb_url: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: String,
        trim: true,
        default: ''
    },
    storageId: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
const Media = mongoose.model('Media', mediaSchema)



module.exports = Media