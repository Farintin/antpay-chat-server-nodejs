const cloudinary = require('cloudinary').v2


// Configuration 
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET
})



module.exports = {
  upload: async (mediaPath, mediaId) => {
    let opt = {
      resource_type: 'auto',
      folder: 'antpay'
    }
    mediaId ? opt.public_id = mediaId : ''
    return cloudinary.uploader.upload(mediaPath, opt)
      .then((data) => {
        // console.log('cld uploader res', data)
        return data
      }).catch((err) => {
        // console.log('cld uplaoder err:', err)
        return err
      })
  },

  scaleImage: async imageId => {
    const url = await cloudinary.url(imageId, {
      width: 100,
      Crop: 'scale'
    })

    // console.log('scaleImage url:', url) 
    // https://res.cloudinary.com/<cloud_name>/image/upload/h_150,w_100/olympic_flag
    return url
  }
}