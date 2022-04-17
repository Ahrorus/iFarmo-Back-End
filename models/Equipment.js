const mongoose = require('mongoose');

const equipmentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: false,
        trim: true
    },
    unitType: {
        type: String,
        required: true,
        trim: true
    },
    datePosted: {
        type: Date,
        required: true,
        default: Date.now
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
