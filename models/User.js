const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    bio: {
        type: String,
        default: ""
    },
    contactInfo: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('User', userSchema);
