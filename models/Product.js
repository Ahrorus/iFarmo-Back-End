const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        trim: true
    },
    unit_type: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
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

module.exports('Product', productSchema);