const router = require('express').Router();
const Equipment = require('../models/Equipment');

router.get('/', async (req, res) => {
    try{//
        if(req.params.queryString == ""){ //default
            if(request.params.filters == ""){//no search filters
                const equipment = await Equipment.find();
            }
            else{ //yes search filters
                const equipment = await Equipment.find();
            }
        }
        else{//search term
            if(request.params.filters == ""){ //no search filters
                const equipment = await Equipment.find();
            }
            else{ //yes search filters
                const equipment = await Equipment.find();
            }
        }
        res.json(equipment);
    }
    catch(err){
        res.json({message: err});
    }
});

router.get('/:equipmentId', async (req, res) => {
    try{
        const equipment = await Equipment.findById(req.params.equipmentId);
        res.json(equipment);
    }
    catch(err){
        res.json({message: err});
    }
});

router.post('/', async (req, res) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied. Token required.');
    }    
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != "farmer"){
            return res.status(403).send("Unauthorized Operation. Must be a farmer to list a job");
        }
        const newEquipment = new Equipment({
            title: req.body.title,
            desc: req.body.desc,
            price: req.body.price,
            type: req.body.unitType,
            quantity: req.body.quantity,
            unitType: req.body.unitType,
            datePosted: req.body.datePosted,
            postedBy: verifiedUser._id
        })
        const savedEquipment = await newEquipment.save();
        res.send({savedEquipment: savedEquipment._id})
    }
    catch(err){
        res.json({message: err});
    }
});

router.patch('/:equipmentId', (req, res) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied. Token required.');
    }    
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != "farmer"){
            return res.status(403).send("Unauthorized Operation. Must be a farmer to list a job");
        }
        const equipment = Equipment.updateOne(
            {_id: req.params.equipmentId}, {$set: {
                title: req.body.title,
                desc: req.body.desc,
                price: req.body.price,
                type: req.body.unitType,
                quantity: req.body.quantity,
                unitType: req.body.unitType,
                datePosted: req.body.datePosted,
                postedBy: verifiedUser._id
            }}
        );
        res.json(updatedEquipment);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:equipmentId', (req, res) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Access Denied. Token required.');
    }    
    try{
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findById(verifiedUser._id);
        if(user.role != "farmer"){
            return res.status(403).send("Unauthorized Operation. Must be a farmer to list a job");
        }
        const deletedEquipment = await Equipment.deleteOne({_id: req.params.equipmentId});
        res.json(deletedEquipment);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;