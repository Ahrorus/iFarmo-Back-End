const router = require('express').Router();
const Job = require('../models/Job');
const User = require('../models/User');

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
    //check for token
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
        const newJob = new Job({
            type: req.body.type,
            title: req.body.title,
            desc: req.body.desc,
            salary: req.body.salary,
            timeUnit: req.body.timeUnit,
            postedBy: req.body.postedBy
        })
        const savedJob = await newJob.save();
        res.send({savedJob: savedJob._id});
    }
    catch(err){
        res.json({message: err});
    }
});

router.patch('/:jobId', async (req, res) => {
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
        const job = Job.updateOne(
            {_id: req.params.jobId}, {$set: {
                type: req.body.type,
                title: req.body.title,
                desc: req.body.desc,
                salary: req.body.salary,
                timeUnit: req.body.timeUnit,
                postedBy: req.body.postedBy
            }}
        );
        res.json(updatedJob);
    }
    catch(err){
        res.json({message: err});
    }
});

router.delete('/:jobId', async (req, res) => {
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
        const deletedJob = await Job.deleteOne({_id: req.params.jobId});
        res.json(deletedJob);
    }
    catch(err){
        res.json({message: err});
    }
});

module.exports = router;