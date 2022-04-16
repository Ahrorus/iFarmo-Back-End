const router = require('express').Router();
const Equipment = require('../models/Equipment');
/* */
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
    try{
        const newEquipment = new Equipment({
            title: req.body.title,
            desc: req.body.desc,
            quantity: req.body.quantity,
            price: req.body.price,
            datePosted: req.body.datePosted,
            postedBy: req.body.postedBy
        })
    }
    catch(err){
        res.json({message: err});
    }
});

router.patch('/:equipmentId', (req, res) => {
    try{
        const equipment = Equipment.updateOne(
            {_id: req.params.equipmentId}, {$set: {
                title: req.body.title,
                desc: req.body.desc,
                quantity: req.body.quantity,
                price: req.body.price,
                datePosted: req.body.datePosted,
                postedBy: req.body.postedBy
            }}
        );
        res.json(updatedEquipment);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:equipmentId', (req, res) => {
    try{
        const deletedEquipment = await Equipment.deleteOne({_id: req.params.equipmentId});
        res.json(deletedEquipment);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;