const mongoose = require('mongoose');

const equipmentSchema = mongoose.Schema({
    equipmentId: String,
    postedBy: String,
    title: String,
    desc: String,
    price: Number,
    datePosted: Date
});

module.exports = mongoose.model('Equipment', equipmentSchema);
