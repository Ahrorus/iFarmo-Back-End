const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const User = require('../models/User');

const buyerSchema = extendSchema(User,{
    
});

module.exports = mongoose.Model('Buyer', buyerSchema);