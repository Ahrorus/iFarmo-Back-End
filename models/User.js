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
    farm: {
        type: String
    },
    bio: {
        type: String
    },
    contactInfo: {
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);
