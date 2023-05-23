const joi = require('joi')



module.exports = {
    createOtp: joi.object().keys({
        phone: joi.object().keys({
            countryName: joi.string()
                .required(),
            countryCode: joi.string()
                .required(),
            number: joi.string()
                .required()
        })
    }),
    verifyOtp: joi.object().keys({
        passcode: joi.string()
            .required(),
        phone: joi.object().keys({
            countryName: joi.string()
                .required(),
            countryCode: joi.string()
                .required(),
            number: joi.string()
                .required()
        })
    }),

    signup: joi.object().keys({
        phone: joi.object().keys({
            countryName: joi.string()
                .required(),
            countryCode: joi.string()
                .required(),
            number: joi.string()
                .required()
        })
            .required(),
        avatar: joi.string(),
        name: joi.string()
            .required(),
        desc: joi.string(),
        status: joi.string(),
        active: joi.boolean()
    })
}