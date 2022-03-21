const router = require('express').Router();
const bcrypt = require('bcryptjs/dist/bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {registerValidation, loginValidation} = require('../util/validation');


// Register
router.post('/register', async (req, res) => {
    // Validate
    const {error} = registerValidation(req.body);
    if (error) {
        return res.status(403).send(error.details[0].message);
    }
    // Check if the email already exists
    const emailExists = await User.findOne({email: req.body.email});
    if (emailExists) return res.status(400).send('Email already exists.');
    // Check if the username already exists
    const usernameExists = await User.findOne({username: req.body.username});
    if (usernameExists) return res.status(400).send('Username already exists.');
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    // Create new user
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        // role: req.body.role,
        password: hashedPassword,
        name: req.body.name
    });
    // Save the user
    try {
        const savedUser = await user.save();
        res.send({ user: savedUser._id });
    } catch(err) {
        res.status(404).send('Unable to register new user.');
    }
});

// Login
router.post('/login', async (req, res) => {
    // Validate
    const {error} = loginValidation(req.body);
    if (error) return res.status(403).send(error.details[0].message);
    // Check if the login as email or username exists
    const user = await User.findOne({email: req.body.login}) || 
                 await User.findOne({username: req.body.login});
    if (!user) return res.status(400).send('User does not exist.');
    // Check if the password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password.');
    // Create and assign a token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;