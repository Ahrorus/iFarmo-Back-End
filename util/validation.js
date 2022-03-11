const Joi = require('@hapi/joi');

// Register user validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().trim().min(5).max(30),
        name: Joi.string().trim().min(2).max(30).required(), 
        // role: Joi.string().trim().valid('user','farmer', 'worker'),
        email: Joi.string().trim().min(8).max(30).required().email(),
        password: Joi.string().trim().min(8).max(30).required()
    });
    return schema.validate(data);
};

// Login user validation
const loginValidation = (data) => {
    const schema = Joi.object({
        login: Joi.string().trim().min(5).max(30).required(),
        password: Joi.string().trim().min(8).max(30).required()
    });
    return schema.validate(data);
};

// Update user validation
const updateUserValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(30).required(), 
        role: Joi.string().trim().valid('user','farmer', 'worker'),
        bio: Joi.string().trim().min(0).max(250),
        contactInfo: Joi.string().trim().min(0).max(30)
    });
    return schema.validate(data);
};

// Create product validation
const productValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(20).required(),
        type: Joi.string().trim().min(2).max(10).required(),
        desc: Joi.string().trim().min(0).max(250),
        quantity: Joi.number(),
        unitType: Joi.string().trim().valid('lbs', 'kg', 'g', 'piece').required(),
        price: Joi.number().required(),
        postedBy: Joi.string().required()
    });
    return schema.validate(data);
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateUserValidation = updateUserValidation;
module.exports.productValidation = productValidation;
