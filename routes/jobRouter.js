const router = require('express').Router();
const Job = require('../models/Job');

router.get('/', async (req, res) => {
    try{//
        if(req.params.queryString == ""){ //default
            if(request.params.filters == ""){//no search filters
                const jobs = await Job.find();
            }
            else{ //yes search filters
                const jobs = await Job.find();
            }
        }
        else{//search term
            if(request.params.filters == ""){ //no search filters
                const jobs = await Job.find();
            }
            else{ //yes search filters
                const jobs = await Job.find();
            }
        }
        res.json(jobs);
    }
    catch(err){
        res.json({message: err});
    }
});

router.get('/:jobId', async (req, res) => {
    try{
        const job = await Job.findById(req.params.jobId);
        res.json(job);
    }
    catch(err){
        res.json({message: err});
    }
});

router.post('/', async (req, res) => {
    try{
        const newJob = new Job({
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

router.patch('/:jobId', (req, res) => {
    try{
        const job = Job.updateOne(
            {_id: req.params.jobId}, {$set: {
                type: req.body.type,
                title: req.body.title,
                desc: req.body.desc,
                salary: req.body.salary,
                timeUnit: req.body.timeUnit,
                datePosted: req.body.datePosted,
                postedBy: req.body.postedBy
            }}
        );
        res.json(updatedJob);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:jobId', (req, res) => {
    try{
        const deletedJob = await Job.deleteOne({_id: req.params.jobId});
        res.json(deletedJob);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;