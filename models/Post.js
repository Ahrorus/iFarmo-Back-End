const mongoose = require('mongoose');

// Post schema
const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trip: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);