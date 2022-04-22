const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {productValidation} = require('../util/validation');

// Get product list
router.get('/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        const filter = req.query.filter;
        if (!searchKey || searchKey == '') {
            if (!filter || filter == 'by_date') {
                const products = await Product.find().sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
            else if (filter == 'by_price') {
                const products = await Product.find().sort({ price: 'asc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
        }
        else {
            const regex = new RegExp(searchKey, "i");
            if (!filter || filter == 'by_date') {
                const products = await Product.find({ 
                    name: regex
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
            else if (filter == 'by_price') {
                const products = await Product.find({ 
                    name: regex
                }).sort({ price: 'asc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not get the product list.");
    }
});

// Get the specific product
router.get('/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId).populate('postedBy', 'username name email contactInfo');
        res.json(product);
    }
    catch(err){
        return res.status(404).send("Could not get the product.");
    }
});

// Create product post
router.post('/', async (req, res) => {
    try {
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
            return res.status(403).send(error.details[0].message);
        }
        // Save the product
        try {
            const newProduct = new Product({
                name: req.body.name,
                type: req.body.type,
                description: req.body.description,
                quantity: req.body.quantity,
                unitType: req.body.unitType,
                price: req.body.price,
                postedBy: verifiedUser._id
            });
            const savedProduct = await newProduct.save();
            user.products = user.products.concat(savedProduct);
            await user.save();
            res.send({ product: savedProduct._id });
        }
        catch(err) {
            return res.status(404).send("Could not save the product.");
        }
    }
    catch(err){
        res.json({message: err});
    }
});

// Update product by id
router.put('/:productId', async (req, res) => {
    try {
        // Get auth-token from header
        const token = req.header('auth-token');
        if(!token){
            return res.status(401).send('Access denied. Token required');
        }
        // Verify the token
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            res.status(400).send('Invalid token.');
        }
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // // Verify product exists
        // const product = await Product.findById(req.params.productId);
        // if (!product) return res.status(404).send('Product not found.');
        // // Verify it's from the same farmer
        // if (verifiedUser._id != product.created_by) {
        //     return res.status(403).send('Unauthorized operation.');
        // }
        // Verify it's from the same farmer
        const product = await Product.findById(req.params.productId);
        if (verifiedUser._id != product.postedBy) {
            return res.status(403).send('Unauthorized operation.');
        }
        // Validate
        const {error} = productValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Update product
        try {
            await Product.updateOne(
                {_id: req.params.productId}, {$set: {
                    name: req.body.name,
                    type: req.body.type,
                    description: req.body.description,
                    quantity: req.body.quantity,
                    unitType: req.body.unitType,
                    price: req.body.price,
                    postedBy: verifiedUser._id
                }}
            );
            const updatedProduct = await Product.findById(req.params.productId);
            res.json(updatedProduct);
        }
        catch(err){
            // If couldn't update the user
            res.status(404).send('Could not update the product.');
        }
    }
    catch(err){
        res.json({message: err});
    }
});

// Delete product by id
router.delete('/:productId', async (req, res) => {
    try {
        // Get auth-token from header
        const token = req.header('auth-token');
        if(!token){
            return res.status(401).send('Access denied. Token required');
        }
        // Verify the token
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            res.status(400).send('Invalid token.');
        }
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // Verify it's from the same farmer
        const user = await User.findById(verifiedUser._id);
        const product = await Product.findById(req.params.productId);
        if (verifiedUser._id != product.postedBy) {
            return res.status(403).send('Unauthorized operation.');
        }
        // Delete product
        try{
            await Product.deleteOne({_id: req.params.productId});
            console.log(user.products);
            user.products = user.products.filter((value) => String(value) !== String(product._id));
            await user.save();
            res.json(product);
        }
        catch(err){
            res.status(404).send('Could not delete the product.');
        }
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;