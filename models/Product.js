const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productId: String,
    name: String,
    type: String,
    desc: String,
    quantity: Number,
    unit_type: String,
    price: Number,
    datePosted: Date
});

module.exports('Product', productSchema);