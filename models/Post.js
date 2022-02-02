const mongoose = require('mongoose');

// Post schema
const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('Post', postSchema);