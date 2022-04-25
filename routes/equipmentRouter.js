const router = require('express').Router();
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {equipmentValidation} = require('../util/validation');

// Get equipment list
router.get('/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        const filter = req.query.filter;
        if (!searchKey || searchKey == '') {
            if (!filter || filter == 'by_date') {
                const equipments = await Equipment.find().sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
            else if (filter == 'by_price') {
                const equipments = await Equipment.find().sort({ price: 'asc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
        }
        else {
            const regex = new RegExp(searchKey, "i");
            if (!filter || filter == 'by_date') {
                const equipments = await Equipment.find({ 
                    $or: [
                        { name: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
            else if (filter == 'by_price') {
                const equipments = await Equipment.find({ 
                    $or: [
                        { name: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ price: 'asc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not get the equipment list.");
    }
});

// Get the specific equipment
router.get('/:equipmenId', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.equipmenId).populate('postedBy', 'username name email contactInfo');
        res.json(equipment);
    }
    catch(err){
        return res.status(404).send("Could not get the equipment.");
    }
});

// Create equipment post
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
        const {error} = equipmentValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Save the equipment
        try {
            const newEquipment = new Equipment({
                title: req.body.title,
                type: req.body.type,
                description: req.body.description,
                quantity: req.body.quantity ? req.body.quantity : 0,
                unitType: req.body.unitType ? req.body.unitType : '',
                price: req.body.price ? req.body.price : 0,
                city: req.body.city,
                postedBy: verifiedUser._id
            });
            const savedEquipment = await newEquipment.save();
            user.equipments = user.equipments.concat(savedEquipment);
            await user.save();
            res.send(savedEquipment);
        }
        catch(err) {
            return res.status(404).send("Could not save the equipment.");
        }
    }
    catch(err){
        console.log(err);
        return res.status(404).send("Could not create the equipment.");
    }
});

// Update equipment by id
router.put('/:equipmentId', async (req, res) => {
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
        // Verify the equipment exists
        const equipment = await Equipment.findById(req.params.equipmentId);
        if (!equipment) return res.status(404).send('Equipment not found.');
        // Verify it's from the same farmer
        if (verifiedUser._id != equipment.postedBy) {
            return res.status(403).send('Unauthorized operation. You are not the owner of this equipment.');
        }
        // Validate
        const {error} = equipmentValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Update the equipment
        try {
            await Equipment.updateOne(
                {_id: req.params.equipmentId}, {$set: {
                    name: req.body.name,
                    type: req.body.type,
                    description: req.body.description,
                    quantity: req.body.quantity ? req.body.quantity : 0,
                    unitType: req.body.unitType ? req.body.unitType : '',
                    price: req.body.price ? req.body.price : 0,
                    postedBy: verifiedUser._id
                }}
            );
            const updatedEquipment = await Equipment.findById(req.params.equipmentId);
            res.json(updatedEquipment);
        }
        catch(err){
            res.status(404).send('Could not save the equipment.');
        }
    }
    catch(err){
        res.status(404).send('Could not update the equipment.');
    }
});

// Delete equipment by id
router.delete('/:equipmentId', async (req, res) => {
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
        // Verify the equipment exists
        const equipment = await Equipment.findById(req.params.equipmentId);
        if (!equipment) return res.status(404).send('Could not find the equipment.');
        // Verify it's from the same farmer
        const user = await User.findById(verifiedUser._id);
        if (verifiedUser._id != equipment.postedBy) {
            return res.status(403).send('Unauthorized operation.');
        }
        // Delete equipment
        try{
            await Equipment.deleteOne({_id: req.params.equipmentId});
            user.equipments = user.equipments.filter((value) => String(value) !== String(equipment._id));
            await user.save();
            res.json(equipment);
        }
        catch(err){
            res.status(404).send('Could not delete the equipment.');
        }
    }
    catch(err){
        console.log(err);
        res.status(404).send('Could not delete the equipment.');
    }
});

// For Testing Purposes
// Delete all equipments
router.delete('/', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        res.send("Successfully deleted all equipments.");
    }
    catch(err){
        return res.status(404).send("Could not delete all equipments.");
    }
});
module.exports = router;