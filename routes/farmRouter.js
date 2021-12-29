const router = require('express').Router();
const Farm = require('../models/Farm');

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
        const farms = await Farm.findById(req.params.farmId);
    } catch (err) {
        res.json({message: err});
    }
});

router.post('/', async (req, res) => {
    try {
        
    } catch (err) {
        console.log("hello");
    }
});

router.patch('/:farmId', (req, res) => {
    try {
        
    } catch (err) {
        
    }
});

router.delete('/:farmId', (req, res) => {
    try{

    } catch(err){

    }
});