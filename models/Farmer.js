const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const User = require('../models/User');

const farmerSchema = extendSchema(User,{
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.Model('Farmer', farmerSchema);