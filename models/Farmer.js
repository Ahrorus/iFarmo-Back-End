const mongoose = require('mongoose');

//use this if userSchema.name == 'farmer'

const farmerSchema = mongoose.Schema({
    id: Number,
    name: String,
    role: String
});