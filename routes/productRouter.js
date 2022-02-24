const router = require('express').Router();
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/', async (req, res) => {
    try{//
        if(req.params.queryString == ""){ //default
            if(request.params.filters == ""){//no search filters
                const products = await Product.find();
            }
            else{ //yes search filters
                const products = await Product.find();
            }
        }
        else{//search term
            if(request.params.filters == ""){ //no search filters
                const products = await Product.find();
            }
            else{ //yes search filters
                const products = await Product.find();
            }
        }
        res.json(products);
    }
    catch(err){
        res.json({message: err});
    }
});

router.get('/:productId', async (req, res) => {
    try{
        const product = await Product.findById(req.params.productId);
        res.json(product);
    }
    catch(err){
        res.json({message: err});
    }
});

router.post('/', async (req, res) => {
    //check for token
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied. Token required.');
    }
    //continue
    try{
        //check if the user is verified and a farmer
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != 'farmer'){
            return res.status(403).send('Unauthorized operation. Only farmers can list products');
        }
        //post product
        const newProduct = new Product({
            name: req.body.name,
            type: req.body.type,
            desc: req.body.desc,
            quantity: req.body.quantity,
            unit_type: req.body.unit_type,
            price: req.body.price
        })
    }
    catch(err){
        res.json({message: err});
    }
});

router.patch('/:productId', (req, res) => {
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
        const product = Product.updateOne(
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

router.delete('/:productId', (req, res) => {
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