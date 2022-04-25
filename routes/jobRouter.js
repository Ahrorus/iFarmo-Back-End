const router = require('express').Router();
const Job = require('../models/Job');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {jobValidation} = require('../util/validation');

// Get job list
router.get('/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        const filter = req.query.filter;
        if (!searchKey || searchKey == '') {
            if (!filter || filter == 'by_date') {
                const jobs = await Job.find().sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
            else if (filter == 'by_salary') {
                const jobs = await Job.find().sort({ salary: 'asc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
        }
        else {
            const regex = new RegExp(searchKey, "i");
            if (!filter || filter == 'by_date') {
                const jobs = await Job.find({ 
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
            else if (filter == 'by_salary') {
                const jobs = await Job.find({ 
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ salary: 'asc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not get the job list.");
    }
});

// Get job list that the user posted from the user's auth token

// Get the specific job
router.get('/:jobId', async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('postedBy', 'username name email contactInfo');
        res.json(job);
    }
    catch(err){
        return res.status(404).send("Could not get the job.");
    }
});

// Create job post
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
        if (user.role == 'user') {
            return res.status(403).send('Unauthorized operation.');
        }
        // Validate input
        const {error} = jobValidation(req.body);
        if (error) { 
            return res.status(403).send(error.details[0].message);
        }
        // Save the job
        try {
            const job = new Job({
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                salary: req.body.salary ? req.body.salary : 0,
                unitType: req.body.unitType ? req.body.unitType : '',
                city: req.body.city,
                postedBy: user._id
            });
            const savedJob = await job.save();
            user.jobs = user.jobs.concat(savedJob);
            await user.save();
            res.json(savedJob);
        }
        catch(err) {
            return res.status(404).send("Could not save the job.");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not create the job.");
    }
});

// Update job post
router.put('/:jobId', async (req, res) => {
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
        // Verify the job exists
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).send("Could not find the job.");
        // Verify it's from the same farmer
        if (job.postedBy.toString() != verifiedUser._id) {
            return res.status(403).send("Unauthorized operation. You are not the owner of this job.");
        }
        // Validate the data
        const {error} = jobValidation(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        // Update the job
        try {
            await Job.updateOne(
                {_id: req.params.jobId}, {$set: {
                    title: req.body.title,
                    description: req.body.description,
                    type: req.body.type,
                    salary: req.body.salary ? req.body.salary : 0,
                    unitType: req.body.unitType ? req.body.unitType : '',
                    city: req.body.location
                }}
            );
            const updatedJob = await Job.findById(req.params.jobId);
            res.json(job);
        }
        catch(err) {
            return res.status(404).send("Could not save the job.");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not update the job.");
    }
});

// Delete job by id
router.delete('/:jobId', async (req, res) => {
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
        // Verify the job exists
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).send("Could not find the job.");
        // Verify it's from the same farmer
        const user = await User.findById(verifiedUser._id);
        if (job.postedBy.toString() != verifiedUser._id) {
            return res.status(403).send("Unauthorized operation. You are not the owner of this job.");
        }
        // Delete the job
        try {
            await Job.deleteOne({_id: req.params.jobId});
            user.jobs = user.jobs.filter((value) => String(value) !== String(job._id));
            await user.save();
            res.json(job);
        }
        catch(err) {
            return res.status(404).send("Could not delete the job.");
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not delete the job.");
    }
});

// For Testing Purposes
// Delete all jobs
router.delete('/', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        await Job.deleteMany({});
        await User.updateMany({}, {$set: {jobs: []}});
        res.json("Successfully deleted all jobs.");
    }
    catch(err) {
        return res.status(404).send("Could not delete all jobs.");
    }
});


module.exports = router;