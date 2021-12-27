const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: Number,
    name: String,
    role: String,
    description: String,
    contactInfo: String
});

module.exports = mongoose.model('User', UserSchema);
