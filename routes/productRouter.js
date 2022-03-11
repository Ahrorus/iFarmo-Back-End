const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {productValidation} = require('../util/validation');

// Get product list
router.get('/', async (req, res) => {
    try{
        const searchKey = req.params.searchKey;
        const filter = req.params.filter;
        if (!searchKey || searchKey == '') {
            if (!filter || filter == 'date_desc') {
                const products = await Product.find().sort({ date: 'desc'});
                res.json(products);
            }
            else if (filter == 'date_asc') {
                const products = await Product.find().sort({ date: 'asc'});
                res.json(products);
            }
        }
        else {
            if (!filter || filter == 'date_desc') {
                const products = await Product.find({ 
                    name: { $regex: searchKey, $options: 'i'}
                }).sort({ date: 'desc'});
                res.json(products);
            }
            else if (filter == 'date_asc') {
                const products = await Product.find({ 
                    name: { $regex: searchKey, $options: 'i'}
                }).sort({ date: 'asc'});
                res.json(products);
            }
        }
    }
    catch(err){
        res.json({message: err});
    }
});

// Get the specific product
router.get('/:productId', async (req, res) => {
    try{
        const product = await Product.findById(req.params.productId);
        res.json(product);
    }
    catch(err){
        res.json({message: err});
    }
});

// Create product post
router.post('/', async (req, res) => {
    // Get auth-token from header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied. Token required.');
    // Verify the token
    try {
        jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    // Verify the user is farmer
    const user = await User.findById(verifiedUser._id);
    if (user.role != 'farmer'){
        return res.status(403).send('Unauthorized operation.');
    }
    // Validate input
    const {error} = productValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Save the product
    try{
        const newProduct = new Product({
            name: req.body.name,
            type: req.body.type,
            desc: req.body.desc,
            quantity: req.body.quantity,
            unitType: req.body.unitType,
            price: req.body.price,
            postedBy: req.body.postedBy
        });
        const savedProduct = await newProduct.save();
        res.send({ product: savedProduct._id });
    }
    catch(err){
        res.json({message: err});
    }
});

// Update product by id
router.put('/:productId', async (req, res) => {
    // Get auth-token from header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied. Token required.');
    // Verify the token
    try {
        jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
    const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
    // Verify the user is farmer
    const user = await User.findById(verifiedUser._id);
    if (user.role != 'farmer') {
        return res.status(403).send('Unauthorized operation.');
    }
    // Verify product exists and it's from the same farmer
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).send('Product not found.');
    if (user._id != product.created_by) {
        return res.status(403).send('Unauthorized operation.');
    }
    // Validate
    const {error} = productValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Update product
    try {
        const updatedProduct = await Product.updateOne(
            {_id: req.params.productId}, {$set: {
                name: req.body.name,
                type: req.body.type,
                desc: req.body.desc,
                quantity: req.body.quantity,
                unitType: req.body.unitType,
                price: req.body.price,
                postedBy: req.body.postedBy
            }}
        );
        res.json(updatedProduct);
    }
    catch(err){
        // If couldn't update the user
        console.log('Could not update the product.');
        res.status(404).send('Could not update the product.');
    }
});

// Delete product by id
router.delete('/:productId', async (req, res) => {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send('Access denied. Token required');
    }
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if (user.role != 'farmer'){
            return res.status(403).send('Unauthorized operation. Only farmers can update products');
        }
        const deletedProduct = await Product.deleteOne({_id: req.params.productId});
        res.json(deletedProduct);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;