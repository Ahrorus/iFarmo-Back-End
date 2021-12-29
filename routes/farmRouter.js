const router = require('express').Router();
const farm = require('../models/Farm');

router.get('/', async (req, res) => {
    try {
        const farms = await farm.find();
        res.json();
    } catch (err) {
        res.json({message: err})
    }
});

router.get('/:farmId', async (req, res) => {
    try {
        const farms = await farm.findById(req.params.farmId);
    } catch (err) {
        
    }
});

router.post('/', async (req, res) => {
    try {
        
    } catch (err) {
        console.log("hello");
    }
})