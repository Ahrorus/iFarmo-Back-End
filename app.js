const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

// Connect to DB
mongoose.connect(process.env.DB_CONNECTION, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((result) => {
    console.log('Connected to MongoDB.')
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err.message)
}); 

// Middleware
app.use(cors());
app.use(express.json());

// Route Middleware
app.use('/api/posts', require('./routes/postRouter'));
app.use('api/auth', require('./routes/authRouter'));
app.user('api/users', require('./routes/userRouter'));

// Listen to server
app.listen(process.env.PORT, () => console.log('Server up and running.'))
