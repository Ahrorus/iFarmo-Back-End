const mongoose = require('mongoose');
const Post = require('./Post');

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
        required: true
    },
    contactInfo: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    posts: {
        type: [Post],
        default: []
    }
});

module.exports = mongoose.model('User', userSchema);
