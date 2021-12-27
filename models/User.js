const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    id: Number,
    name: String,
    role: String
});
