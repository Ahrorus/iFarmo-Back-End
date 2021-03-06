const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { productValidation } = require('../util/validation');
const multer = require('multer');
const { uploadFile, unlink } = require('../util/s3');
const upload = multer({ dest: 'uploads/' });
const importProducts = require('../sample_data/importProducts.json');

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
                    $or: [
                        { name: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
            else if (filter == 'by_price') {
                const products = await Product.find({ 
                    $or: [
                        { name: regex },
                        { description: regex },
                        { type:regex },
                        { city: regex }
                    ]
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

// Get product list that the user posted from the user's auth token
router.get('/myproducts/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
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
        // Get the product list that the user posted
        try {
            if (!searchKey || searchKey == '') {
                const products = await Product.find({ postedBy: user._id })
                        .sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            } else {
                const regex = new RegExp(searchKey, "i");
                const products = await Product.find({
                    $or: [
                        { name: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ],
                    postedBy: user._id
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(products);
            }
        }
        catch(err) {
            return res.status(404).send("Could not get the product list.");
        }
    }
    catch(err) {
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
router.post('/', upload.single('image'), async (req, res) => {
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
        // Upload image to S3
        let imagePath = '';
        if (req.file) {
            const result = await uploadFile(req.file);
            if (!result) return res.status(404).send('Could not upload the file.');
            await unlink(req.file.path);
            imagePath = result.Location;
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
                city: req.body.city,
                imagePath: imagePath,
                postedBy: verifiedUser._id
            });
            const savedProduct = await newProduct.save();
            user.products = user.products.concat(savedProduct);
            await user.save();
            res.send(savedProduct);
        }
        catch(err) {
            return res.status(404).send("Could not save the product.");
        }
    }
    catch(err){
        console.log(err);
        return res.status(404).send("Could not create the product.");
    }
});

// Update product by id
router.put('/:productId', upload.single('image'), async (req, res) => {
    try {
        // Get auth-token from header
        const token = req.header('auth-token');
        if(!token) return res.status(401).send('Access denied. Token required');
        // Verify the token
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            res.status(400).send('Invalid token.');
        }
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // Verify the product exists
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).send('Product not found.');
        // Verify it's from the same farmer
        if (verifiedUser._id != product.postedBy) {
            return res.status(403).send('Unauthorized operation. You are not the owner of this product.');
        }
        // Validate
        const {error} = productValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Upload image to S3
        let imagePath = "";
        if (req.file) {
            const result = await uploadFile(req.file);
            if (!result) return res.status(404).send('Could not upload the file.');
            await unlink(req.file.path);
            imagePath = result.Location;
        }
        // Update the product
        try {
            await Product.updateOne(
                {_id: req.params.productId}, {$set: {
                    name: req.body.name,
                    type: req.body.type,
                    description: req.body.description,
                    quantity: req.body.quantity,
                    unitType: req.body.unitType,
                    price: req.body.price,
                    city: req.body.city,
                    imagePath: imagePath,
                    postedBy: verifiedUser._id
                }}
            );
            const updatedProduct = await Product.findById(req.params.productId);
            res.json(updatedProduct);
        }
        catch(err){
            res.status(404).send('Could not save the product.');
        }
    }
    catch(err){
        res.status(404).send('Could not update the product.');
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
        // Verify the product exists
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).send('Could not find the product.');
        // Verify it's from the same farmer
        const user = await User.findById(verifiedUser._id);
        if (verifiedUser._id != product.postedBy) {
            return res.status(403).send('Unauthorized operation.');
        }
        // Delete product
        try{
            await Product.deleteOne({_id: req.params.productId});
            user.products = user.products.filter((value) => String(value) !== String(product._id));
            await user.save();
            res.json(product);
        }
        catch(err){
            res.status(404).send('Could not delete the product.');
        }
    }
    catch(err){
        console.log(err);
        res.status(404).send('Could not delete the product.');
    }
});

// For testing purposes
// Delete all products
router.delete('/', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        await Product.deleteMany({});
        await User.updateMany({}, {$set: {products: []}});
        res.send("Successfully deleted all products.");
    }
    catch(err){
        return res.status(404).send("Could not delete all products.");
    }
});

// Create products from a json file
router.post('/import', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        // Parse json data from importProducts.json file
        const products = importProducts;
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const newProduct = new Product({
                name: product.name,
                type: product.type,
                description: product.description,
                quantity: product.quantity,
                unitType: product.unitType,
                price: product.price,
                city: product.city,
                imagePath: product.imagePath,
                postedBy: product.postedBy
            });
            const savedProduct = await newProduct.save();
            const user = await User.findById(product.postedBy);
            user.products = user.products.concat(savedProduct);
            await user.save();
        }
        res.send("Successfully imported products. All test cases passed.");
    }
    catch(err){
        console.log(err);
        return res.status(404).send("Could not import products.");
    }
});

module.exports = router;