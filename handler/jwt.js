const jwt = require('jsonwebtoken')

const User = require('../model/user.model')





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
        expiresIn: '7d'
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

const verifyToken = async token => {
    return await jwt.verify(token, ACCESS_TOKEN_SECRET, (err, doc) => {
        if (err) {
            return null
        }
        return doc
    })
}

const jwtAuthHandler = async (req, res, next) => {
    const token = req.headers['authorization'].split('Bearer ')[1]
    // console.log('token:', token);
    if (!token) {
        // Authentication token must be "Bearer [token]"
        return res.status(403).json('Unauthorized')
    }

    const jwtResult = await verifyToken(token)
    if (!jwtResult) {
        // Invalid/Expired token
        // console.log('Invalid/Expired token', jwtResult);
        return res.status(401).json('Unauthorized')
    }

    // console.log('jwtResult:', jwtResult);
    req.userId = jwtResult.sub
    return next()
}



module.exports = {
    generateAccessToken,
    verifyToken,
    jwtAuthHandler
}