const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch(err) {
        res.json({ message: err });
    }
});

// Get a signle user by id
router.get('/:userId', async (req, res) => {
    // Get auth-token from header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied. Token required.');
    try {
        // Verify the token
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // Try get the user
        try {
            const user = await User.findById(req.params.userId);
            res.json(user);
        } catch(err) {
            // If couldn't get the user
            console.log('Could not find the user.');
            res.status(404).send('Could not find the user.');
        }
    } catch (err) {
        // If the token is wrong
        res.status(400).send('Invalid token.');
    }
});

// Update user's info
router.put('/:userId', async (req, res) => {
    // Get auth-token from header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied. Token required.');
    try {
        // Verify the token
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // If it's the wrong user
        if (req.params.userId != verifiedUser._id) res.status(403).send('Unauthorized operation.');
        // Try update the user
        try {
            const updatedUser = await User.findOneAndUpdate(
                {_id: req.params.userId}, 
                {$set: {
                    name: req.body.name,
                    role: req.body.role,
                    bio: req.body.bio,
                    contactInfo: req.body.contactInfo
                }},
                {new: true} // Makes sure to return the newly updatedUser
            );
            console.log(updatedUser);
            res.json(updatedUser);
        } catch(err) {
            // If couldn't update the user
            console.log('Could not update the user.');
            res.status(404).send('Could not update the user.');
        }
    } catch (err) {
        // If the token is wrong
        res.status(400).send('Invalid token.');
    }
});

// Delete a user by id
router.delete('/:userId', async (req, res) => {
    // Get auth-token from header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied. Token required.');
    try {
        // Verify the token
        const verifiedUser = jwt.verify(token, process.env.TOKEN_SECRET);
        // If it's the wrong user
        if (req.params.userId != verifiedUser._id) res.status(403).send('Unauthorized operation.');
        // Try delete the user
        try {
            const user = await User.findById(req.params.userId);
            res.json(user);
        } catch(err) {
            // If couldn't delete the user
            console.log('Could not delete the user.');
            res.status(404).send('Could not delete the user.');
        }
    } catch (err) {
        // If the token is wrong
        res.status(400).send('Invalid token.');
    }
});

module.exports = router;
