const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    jobId: String,
    type: String,
    title: String,
    desc: String,
    datePosted: Date,
});

module.exports('Job', jobSchema);