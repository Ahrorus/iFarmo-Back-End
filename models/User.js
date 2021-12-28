const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: String,
    email: String,
    password: String,
    name: String,
    role: String,
    farm: String,
    bio: String,
    contactInfo: String
});

module.exports = mongoose.model('User', UserSchema);
