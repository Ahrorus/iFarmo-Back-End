const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    type: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: false
    },
    quantity: {
        type: Number,
        required: false
    },
    unitType: {
        type: String,
        trim: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    datePosted: {
        type: Date,
        required: true,
        default: Date.now
    },
    postedBy: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);