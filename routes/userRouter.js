const router = require('express').Router();
const user = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const users = await user.find();
        res.json(users);
    } catch(err) {
        res.json({ message: err });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const user = await user.findById(req.params.userId);
        res.json(user);
    } catch(err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role,
        farm: req.body.farm,
        bio: req.body.bio,
        contactInfo: req.body.contactInfo
    });
    try {
        const savedUser = await post.save();
        res.json(savedUser);
    } catch(err) {
        res.json({ message: err });
    }
});

router.patch('/:userId', async (req, res) => {
    try {
        const updatedUser = await Post.updateOne(
            {_id: req.params.userId}, {$set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                name: req.body.name,
                role: req.body.role,
                farm: req.body.farm,
                bio: req.body.bio,
                contactInfo: req.body.contactInfo
            }}
        );
        res.json(updatedUser);
    } catch(err) {
        res.json({ message: err });
    }
});

router.delete('/:userId', async (req, res) => {
    try {
        const removedUser = await Post.deleteOne({ _id: req.params.userId });
        res.json(removedUser);
    } catch (err) {
        res.json({ message: err });
    }
    
});

module.exports = router;
