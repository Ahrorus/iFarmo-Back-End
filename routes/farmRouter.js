const router = require('express').Router();
const res = require('express/lib/response');
const Farm = require('../models/Farm');

router.get('/', async (req, res) => {
    try {
        const farms = await Farm.find();
        res.json(farms);
    } catch (err) {
        res.json({message: err})
    }
});

router.get('/:farmId', async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.farmId);
        res.json(farm);
    } catch (err) {
        res.json({message: err});
    }
});

router.post('/', async (req, res) => {
    try {
        const farm = new Farm({
            name: req.body.name,
            location: req.body.location
        });
    } catch (err) {
        res.json({message: err});
    }
});

router.patch('/:farmId', async (req, res) => {
    try {
        const updatedFarm = await Farm.updateOne(
            {_id: req.params.farmId}, 
            {$set: {
                name: req.body.name,
                location: req.body.location
            }}
        );
        res.json(updatedFarm);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:farmId', async (req, res) => {
    try{
        const removedFarm = await Farm.deleteone({ _id: req.params.farmId});
        res.json(removedFarm);
    } catch (err) {
        res.json({ message: err });
    }
});