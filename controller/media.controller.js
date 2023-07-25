const Media = require('../model/media.model')
const cld = require('../cloudinary')



module.exports = {
    upload: async (req, res) => {
        let reqBody = req.body
        let resPayload = {data: {}}

        const { media, type } = reqBody

        try {
            const cldRes = await cld.upload(media)
            console.log('cldRes:', cldRes)

            let thumb_url = ''
            if (type === 'image') {
                thumb_url = await cld.scaleImage(cldRes.public_id)
                console.log('thumb_url:', thumb_url)
            }

            const newMedia = new Media({
                url: cldRes.secure_url,
                thumb_url,
                storageId: cldRes.public_id,
                type
            })
            newMedia.save(async (err, doc) => {
                if (err) {
                    resPayload.msg = 'error'
                    resPayload.from = 'Mongodb'
                    resPayload.data = err
                    return res.json(resPayload)
                }
                
                resPayload.data.mediaId = doc._id
                resPayload.msg = 'success'
                res.json(resPayload)
            })
        } catch(err) {
            console.log('err:', err)
            resPayload.error = true
            resPayload.data = err
            res.status(403).json(resPayload)
        }
    }
}