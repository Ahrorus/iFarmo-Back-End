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
    console.log('Connected to MongoDB.');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err.message);
}); 

// Middleware
app.use(cors());
app.use(express.json());

// Route Middleware
app.use('/api/posts', require('./routes/postRouter'));
app.use('/api/auth', require('./routes/authRouter'));
app.use('/api/users', require('./routes/userRouter'));
app.use('/api/products', require('./routes/productRouter'));
app.use('/api/jobs', require('./routes/jobRouter'));
app.use('/api/equipments', require('./routes/equipmentRouter'));

// Listen to server
app.listen(process.env.PORT || 80, () => console.log('Server up and running.'))
