const bodyParser = require('body-parser');
const res = require('express/lib/response');
const Farm = require('../models/Farm');
const router = require('express').Router();

router.use(bodyParser.json());
router.get('/', async (req, res) => {
    try {
        const farms = await Farm.find();
        res.setHeader('Content-Type', 'application/json');
        res.status = 200;
        res.json(farms);
    } catch (err) {
        res.status(404).send('Server error. Unable to find  farm.');
    }
});

router.get('/:farmId', async (req, res) => {
    try {
        const farm = await Farm.findById(req.params.farmId);
        res.json(farm);
    } catch (err) {
        res.status(404).send('Server error. Unable to find farm.');
    }
});
 router.post('/', async (req, res) => {
    try {
        const farm = new Farm({
            name: req.body.name,
            location: req.body.location
        });
    } catch (err) {
        res.status(500).send('Server error. Unable to create new farm.');
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
        res.status(500).send('Server error. Unable to create new farm.');
    }
});

router.delete('/:farmId', async (req, res) => {
    try{
        const removedFarm = await Farm.deleteone({ _id: req.params.farmId});
        res.json(removedFarm);
    } catch (err) {
        res.status(500).send('Server error. Unable to create new farm.');
    }
});