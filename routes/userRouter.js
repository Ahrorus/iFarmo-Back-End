const router = require('express').Router();
const User = require('../models/User');
const verify = require('../util/verifyToken');

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
router.get('/:userId', verify, async (req, res) => {
    if (req.params.userId != req.user._id) res.status(403).send('Unauthorized operation.');
    try {
        const user = await User.findById(req.params.userId);
        res.json(user);
    } catch(err) {
        console.log('Could not find the user.');
        res.json({ message: err });
    }
});

// Update user's info
router.put('/:userId', verify, async (req, res) => {
    if (req.params.userId != req.user._id) res.status(403).send('Unauthorized operation.');
    try {
        const updatedUser = await User.findOneAndUpdate({_id: req.params.userId}, {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            role: req.body.role,
            bio: req.body.bio,
            contactInfo: req.body.contactInfo
        });
        // const updatedUser = await User.updateOne(
        //     {_id: req.params.userId}, {$set: {
        //         username: req.body.username,
        //         email: req.body.email,
        //         password: req.body.password,
        //         name: req.body.name,
        //         role: req.body.role,
        //         bio: req.body.bio,
        //         contactInfo: req.body.contactInfo
        //     }}
        // );
        console.log(updatedUser);
        res.json(updatedUser);
    } catch(err) {
        console.log('Could not update the user.');
        res.json({ message: err });
    }
});

// Delete a user by id
router.delete('/:userId', verify, async (req, res) => {
    if (req.params.userId != req.user._id) res.status(403).send('Unauthorized operation.');
    try {
        const removedUser = await User.deleteOne({ _id: req.params.userId });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
    
});

module.exports = router;
