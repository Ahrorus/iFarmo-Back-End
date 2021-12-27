const mongoose = require('mongoose');

//use this if userSchema.name == 'farmer'
const farmerSchema = mongoose.Schema({
    id: Number,
    name: String,
    farm: String,
    products: Array,
    description: String,
    contactInfo: String
});

module.exports = mongoose.model('Farmer', farmerSchema);
