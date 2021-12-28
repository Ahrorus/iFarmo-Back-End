const mongoose = require('mongoose');

const farmSchema = mongoose.Schema({
    farmId: String,
    name: String,
    location: String
});

module.exports = mongoose.module('Farm',farmSchema);