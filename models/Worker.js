const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const User = require('../models/User');

const workerSchema = extendSchema(User,{
    recommendations: {
        type: [String],
        required: false
    }
});

module.exports = mongoose.Model('Worker', workerSchema);