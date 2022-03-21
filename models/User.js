const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        trim: true,
        required: true,
        default: 'farmer'
    },
    bio: {
        type: String,
        trim: true,
        default: ''
    },
    contactInfo: {
        type: String,
        trim: true,
        default: ''
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    jobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    equipments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
    }],
    farms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    }]
});

module.exports = mongoose.model('User', userSchema);
