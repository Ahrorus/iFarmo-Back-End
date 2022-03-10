const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const productValidation = require('../util/validation');

// Get product list
router.get('/', async (req, res) => {
    try{//
        const searchKey = req.params.searchKey;
        const filter = req.params.filter;
        let products = await Product.find();
        if (searchKey != '')
            products = products.find({ name: { $regex: searchKey, $options: 'i'}});
        if (filter == 'date_asc')
            products = products.sort({ date: 'asc'});
        if (filter == 'date_desc')
            products = products.sort({ date: 'desc'});
        res.json(products);
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
    // Check for token
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied. Token required.');
    }
    // Continue
    try{
        // Check if the user is verified and a farmer
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != 'farmer'){
            return res.status(403).send('Unauthorized operation. Only farmers can list products');
        }
        // Validate
        const {error} = productValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Post product
        const newProduct = new Product({
            name: req.body.name,
            type: req.body.type,
            desc: req.body.desc,
            quantity: req.body.quantity,
            unit_type: req.body.unit_type,
            price: req.body.price
        });
        const savedProduct = await newProduct.save();
        res.send({ product: savedProduct._id });
    }
    catch(err){
        res.json({message: err});
    }
});

// Update product
router.put('/:productId', async (req, res) => {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send('Access denied. Token required');
    }
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != 'farmer'){
            return res.status(403).send('Unauthorized operation. Only farmers can update products');
        }
        // Validate
        const {error} = productValidation(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        // Update product
        const updatedProduct = await Product.updateOne(
            {_id: req.params.productId}, {$set: {
                name: req.body.name,
                type: req.body.type,
                desc: req.body.desc,
                quantity: req.body.quantity,
                unit_type: req.body.unit_type,
                price: req.body.price,
            }}
        );
        res.json(updatedProduct);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:productId', async (req, res) => {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send('Access denied. Token required');
    }
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != 'farmer'){
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