const handleResult = (req, res, next, result) => {
    const error = result.error
    if (error) {
        let resPayload = {}
        resPayload.error = true
        resPayload.from = 'Joi middleware'
        resPayload.msg = error
        return res.json(resPayload)
    }
    
    req.body = result.value
    return next()
}

module.exports = schema => {
    return (req, res, next) => {
        const result = schema.validate(req.body, {abortEarly: false})
        return handleResult(req, res, next, result)
    }
}