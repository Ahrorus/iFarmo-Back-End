const Joi = require('@hapi/joi');

// Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().trim().min(8).max(30),
        name: Joi.string().trim().min(2).max(60).required(),
        email: Joi.string().trim().min(8).max(60).required().email(),
        password: Joi.string().trim().min(8).max(255).required()
    });
    return schema.validate(data);
};

// Login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        login: Joi.string().trim().min(8).max(255).required(),
        password: Joi.string().trim().min(8).max(255).required()
    });
    return schema.validate(data);
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
