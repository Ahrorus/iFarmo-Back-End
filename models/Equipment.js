const mongoose = require('mongoose');

const equipmentSchema = mongoose.Schema({
    postedBy: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
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
