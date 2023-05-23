const jwt = require('jsonwebtoken')



const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const generateAccessToken = userId => {
    //const iat = Math.floor(new Date().getTime() / 1000)
    const token = jwt.sign({
        iss: 'antpay_chat_server',
        sub: userId,
        //exp: Math.floor(new Date().setDate(new Date().getDate() + 1) / 1000)
    }, 
    ACCESS_TOKEN_SECRET,
    {
        expiresIn: '1h'
    })

    return token
}

/* const generateRefreshToken = userId => {
    const token = jwt.sign({
        iss: 'antpay_chat_server',
        sub: userId
    },
    ACCESS_TOKEN_SECRET,
    {
        expiresIn: '1d'
    })

    return token
} */

/* const verifyToken = token => {
    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, doc) => {
        if (err) {
            return null
        }
        return doc
    })
} */



module.exports = {
    generateAccessToken,
    // generateRefreshToken,
    // verifyToken
}