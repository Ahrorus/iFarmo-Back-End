const mongoose = require("mongoose");

const buyerSchema = mongoose.Schema({
    id: Number,
    name: String,
    role: String,
    description: String,
    contactInfo: String
});

module.exports = moongose.model('Buyer', buyerSchema);