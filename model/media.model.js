const mongoose = require('mongoose')



const Schema = mongoose.Schema
const mediaSchema = new Schema({
    url: {
        type: String,
        default: ''
    },
    thumb_url: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    storageId: {
        type: String,
        default: ''
    }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})
const Media = mongoose.model('Media', mediaSchema)



module.exports = Media