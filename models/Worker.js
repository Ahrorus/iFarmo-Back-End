const mongoose = require('mongoose');

const workerSchema = mongoose.Schema({
    id: Number,
    name: String,
    role: String,
    description: String,
    contactInfo: String
});

module.exports = mongoose.model('Worker', workerSchema);
