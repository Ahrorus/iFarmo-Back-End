const Joi = require('@hapi/joi');

// Register user validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().trim().min(5).max(30),
        name: Joi.string().trim().min(2).max(30).required(), 
        // role: Joi.string().trim().valid('user','farmer', 'worker'),
        email: Joi.string().trim().min(8).max(30).required().email(),
        password: Joi.string().trim().min(6).max(30).required()
    });
    return schema.validate(data);
};

// Login user validation
const loginValidation = (data) => {
    const schema = Joi.object({
        login: Joi.string().trim().min(5).max(30).required(),
        password: Joi.string().trim().min(6).max(30).required()
    });
    return schema.validate(data);
};

// Update user validation
const updateUserValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(30).required(), 
        role: Joi.string().trim().valid('user','farmer', 'worker'),
        bio: Joi.string().trim().max(250).allow(null, ''),
        contactInfo: Joi.string().trim().min(0).max(30)
    });
    return schema.validate(data);
};

// Product validation
const productValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(2).max(20).required(),
        type: Joi.string().trim().required().valid('Fruit', 'Vegetable', 'Grains', 'Nuts', 'Meat', 'Dairy', 'Baked goods', 'Plants', 'Other'),
        description: Joi.string().trim().max(250).allow(null, ''),
        quantity: Joi.number().positive(),
        unitType: Joi.string().trim().required().valid('lb', 'kg', 'g', 'gal', 'litre', 'piece'),
        price: Joi.number().required().positive(),
        city: Joi.string().trim().min(2).max(30)
    });
    return schema.validate(data);
};

// Job validation
const jobValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(30).required(),
        type: Joi.string().trim().required().valid('temporary', 'full-time', 'part-time'),
        description: Joi.string().trim().max(250).allow(null, ''),
        salary: Joi.number().positive(),
        unitType: Joi.string().trim().required().valid('one-time', 'hour', 'day', 'week', 'month'),
        city: Joi.string().trim().min(2).max(30)
    });
    return schema.validate(data);
};

// Eqipment validation
const equipmentValidation = (data) => {
    const schema = Joi.object({
        title: Joi.string().trim().min(2).max(30).required(),
        type: Joi.string().trim().required().valid('Tools', 'Materials'),
        description: Joi.string().trim().max(250).allow(null, ''),
        quantity: Joi.number().positive(),
        unitType: Joi.string().trim().required().valid('lb', 'kg', 'g', 'piece', 'hour', 'day', 'week', 'month'),
        price: Joi.number().required().positive(),
        city: Joi.string().trim().min(2).max(30)
    });
    return schema.validate(data);
};


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateUserValidation = updateUserValidation;
module.exports.productValidation = productValidation;
module.exports.jobValidation = jobValidation;
