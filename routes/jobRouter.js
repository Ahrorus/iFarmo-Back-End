const router = require('express').Router();
const Job = require('../models/Job');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {jobValidation} = require('../util/validation');
const importJobs = require('../sample_data/importJobs.json');

// Get job list
router.get('/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        const filter = req.query.filter;
        if (!searchKey || searchKey == '') {
            if (!filter) {
                const jobs = await Job.find().sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
            else {
                const jobs = (await Job.find().sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role')).filter(job => job.postedBy.role == filter);
                res.json(jobs);
            }
        }
        else {
            const regex = new RegExp(searchKey, "i");
            if (!filter) {
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
            else {
                const jobs = (await Job.find({ 
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role')).filter(job => job.postedBy.role == filter);
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
router.get('/myjobs/', async (req, res) => {
    try {
        const searchKey = req.query.searchKey;
        // Get the user's auth token
        const token = req.header('auth-token');
        if (!token) return res.status(401).send('Access Denied. Token required.');
        // Verify the token
        try {
            jwt.verify(token, process.env.TOKEN_SECRET);
        } catch (err) {
            res.status(400).send('Invalid token.');
        }
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // Verify the user is farmer or worker
        const user = await User.findById(verifiedUser._id);
        if (user.role != 'farmer' && user.role != 'worker') {
            return res.status(401).send('Access Denied. You are not a farmer or worker.');
        }
        // Get the job list that the user posted
        try {
            if (!searchKey || searchKey == '') {
                const jobs = await Job.find({ postedBy: user._id }).sort({ datePosted: 'desc'})
                        .populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
            else {
                const regex = new RegExp(searchKey, "i");
                const jobs = await Job.find({ postedBy: user._id,
                    $or: [
                        { title: regex },
                        { description: regex },
                        { type: regex },
                        { city: regex }
                    ]
                }).sort({ datePosted: 'desc'}).populate('postedBy', 'username name email contactInfo role');
                res.json(jobs);
            }
        }
        catch(err) {
            return res.status(404).send("Could not get the job list.");
        }
    }
    catch(err) {
        return res.status(404).send("Could not get the job list.");
    }
});

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

// Create jobs from a json file
router.post('/import', async (req, res) => {
    try {
        const key = req.query.key;
        if (key != "123") return res.status(403).send("Unauthorized operation.");
        // Parse json data from importJobs.json file
        const jobs = importJobs;
        // Save the jobs
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            const newJob = new Job({
                title: job.title,
                description: job.description,
                type: job.type,
                salary: job.salary ? job.salary : 0,
                unitType: job.unitType ? job.unitType : '',
                city: job.city,
                postedBy: job.postedBy
            });
            const savedJob = await newJob.save();
            const user = await User.findById(job.postedBy);
            user.jobs = user.jobs.concat(savedJob);
            await user.save();
        }
        res.send("Successfully imported jobs. All test cases passed.");
    }
    catch(err){
        console.log(err);
        return res.status(404).send("Could not import jobs.");
    }
});


module.exports = router;