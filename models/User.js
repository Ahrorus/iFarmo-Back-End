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
    farm: {
        type: String
    },
    bio: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String
    },
    posts: {
        type: [Post]
    }
});

module.exports = mongoose.model('User', userSchema);
