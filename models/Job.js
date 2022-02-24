const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    type: {
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
    salary: {
        type: Number,
        required: true,
        trim: true
    },
    timeUnit: {
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

module.exports = mongoose.model('Job', jobSchema);