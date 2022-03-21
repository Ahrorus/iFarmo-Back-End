const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {updateUserValidation} = require('../util/validation');

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
    try {
        const user = await User.findById(req.params.userId).select('-password');
        res.json(user);
    } catch(err) {
        // If couldn't get the user
        res.status(404).send('Could not find the user.');
    }
});

// Update user's info
router.put('/', async (req, res) => {
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
        // Validate
        const {error} = updateUserValidation(req.body);
        if (error) {
            return res.status(403).send(error.details[0].message);
        }
        // Try update the user
        try {
            const updatedUser = await User.findOneAndUpdate(
                {_id: verifiedUser._id}, 
                {$set: {
                    name: req.body.name,
                    role: req.body.role,
                    bio: req.body.bio,
                    contactInfo: req.body.contactInfo
                }},
                {new: true} // Makes sure to return the newly updatedUser
            );
            res.json(updatedUser);
        } catch(err) {
            // If couldn't update the user
            res.status(404).send('Could not update the user.');
        }
    } catch (err) {
        res.json({message: err});
    }
});

// Delete a user by id
router.delete('/', async (req, res) => {
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
        // Try delete the user
        try {
            const user = await User.findByIdAndDelete(verifiedUser._id);
            res.json(user);
        } catch(err) {
            // If couldn't delete the user
            res.status(404).send('Could not delete the user.');
        }
    } catch(err) {
        res.json({message: err});
    }
});

module.exports = router;
