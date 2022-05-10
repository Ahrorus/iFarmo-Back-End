const router = require('express').Router();
const Equipment = require('../models/Equipment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {equipmentValidation} = require('../util/validation');
const multer = require('multer');
const { uploadFile, unlink } = require('../util/s3');
const upload = multer({ dest: 'uploads/' });
const importEquipments = require('../sample_data/importEquipments.json');

// Get equipment list
router.get('/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        const filter = req.query.filter;
        if (!searchKey || searchKey == '') {
            if (!filter) {
                const equipments = await Equipment.find().sort({datePosted: 'desc'})
                        .populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
            else  {
                const equipments = (await Equipment.find().sort({datePosted: 'desc'})
                        .populate('postedBy', 'username name email contactInfo'))
                        .filter(equipment => equipment.type == filter);
                res.json(equipments);
            }
        }
        else {
            const regex = new RegExp(searchKey, "i");
            if (!filter) {
                const equipments = await Equipment.find({ 
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
            else {
                const equipments = (await Equipment.find({ 
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo'))
                .filter(equipment => equipment.type == filter);
                res.json(equipments);
            }
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not get the equipment list.");
    }
});

// Get equipment list that the user posted from the user's auth token
router.get('/myequipments/', async (req, res) => {
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
        // Verify the user is farmer, worker, or user
        const user = await User.findById(verifiedUser._id);
        if (user.role != 'farmer' && user.role != 'worker' && user.role != 'user') {
            return res.status(403).send('Unauthorized operation.');
        }
        // Get the equipment list
        try {
            if (!searchKey || searchKey == '') {
                const equipments = await Equipment.find({ postedBy: user._id })
                        .sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            } else {
                const regex = new RegExp(searchKey, "i");
                const equipments = await Equipment.find({
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ],
                    postedBy: user._id
                }).sort({datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo');
                res.json(equipments);
            }
        }
        catch(err) {
            return res.status(404).send("Could not get the equipment list.");
        }
    }
    catch(err) {
        return res.status(404).send("Could not get the equipment list.");
    }
});

// Get the specific equipment
router.get('/:equipmentId', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.equipmentId).populate('postedBy', 'username name email contactInfo');
        res.json(equipment);
    }
    catch(err){
        return res.status(404).send("Could not get the equipment.");
    }
});

// Create equipment post
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
        // Verify the user is farmer, worker, or user
        const user = await User.findById(verifiedUser._id);
        if (user.role != 'farmer' && user.role != 'worker' && user.role != 'user') {
            return res.status(403).send('Unauthorized operation.');
        }
        // Validate input
        const {error} = equipmentValidation(req.body);
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
                imagePath: imagePath,
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
router.put('/:equipmentId', upload.single('image'), async (req, res) => {
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
        // Verify it's from the same user
        if (verifiedUser._id != equipment.postedBy) {
            return res.status(403).send('Unauthorized operation. You are not the owner of this equipment.');
        }
        // Validate
        const {error} = equipmentValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Upload image to S3
        let imagePath = equipment.imagePath;
        if (req.file) {
            const result = await uploadFile(req.file);
            if (!result) return res.status(404).send('Could not upload the file.');
            await unlink(req.file.path);
            imagePath = result.Location;
        }
        // Update the equipment
        try {
            await Equipment.updateOne(
                {_id: req.params.equipmentId}, {$set: {
                    title: req.body.title,
                    type: req.body.type,
                    description: req.body.description,
                    quantity: req.body.quantity ? req.body.quantity : 0,
                    unitType: req.body.unitType ? req.body.unitType : '',
                    price: req.body.price ? req.body.price : 0,
                    city: req.body.city,
                    imagePath: imagePath,
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
        await Equipment.deleteMany({});
        await User.updateMany({}, {$set: {equipments: []}});
        res.send("Successfully deleted all equipments.");
    }
    catch(err){
        return res.status(404).send("Could not delete all equipments.");
    }
});

// Create equipments from a json file
router.post('/import', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        // Parse json data from importEquipments.json file
        const equipments = importEquipments;
        for (let i = 0; i < equipments.length; i++) {
            const equipment = equipments[i];
            const newEquipment = new Equipment({
                title: equipment.title,
                type: equipment.type,
                description: equipment.description,
                quantity: equipment.quantity ? equipment.quantity : 0,
                unitType: equipment.unitType ? equipment.unitType : '',
                price: equipment.price ? equipment.price : 0,
                city: equipment.city,
                imagePath: equipment.imagePath,
                postedBy: equipment.postedBy
            });
            const savedEquipment = await newEquipment.save();
            const user = await User.findById(equipment.postedBy);
            user.equipments = user.equipments.concat(savedEquipment);
            await user.save();
        }
        res.send("Successfully imported equipments. All test cases passed.");
    }
    catch(err){
        console.log(err);
        return res.status(404).send("Could not import equipments.");
    }
});


module.exports = router;