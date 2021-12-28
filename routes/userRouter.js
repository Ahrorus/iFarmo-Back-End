const router = require('express').Router();
const user = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const users = await user.find();
        res.json(posts);
    } catch(err) {
        res.json({ message: err });
    }
});

router.get('/:userId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        res.json(post);
    } catch(err) {
        res.json({ message: err });
    }
});

router.post('/', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        description: req.body.description
    });
    try {
        const savedPost = await post.save();
        res.json(savedPost);
    } catch(err) {
        res.json({ message: err });
    }
});

router.patch('/:postId', async (req, res) => {
    try {
        const updatedPost = await Post.updateOne(
            {_id: req.params.postId}, {$set: {
                title: req.body.title,
                description: req.body.description
            }}
        );
        res.json(updatedPost);
    } catch(err) {
        res.json({ message: err });
    }
});

router.delete('/:postId', async (req, res) => {
    try {
        const removedPost = await Post.deleteOne({ _id: req.params.postId });
        res.json(removedPost);
    } catch (err) {
        res.json({ message: err });
    }
    
});

module.exports = router;
