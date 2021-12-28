const mongoose = require('mongoose');

const farmSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.module('Farm',farmSchema);