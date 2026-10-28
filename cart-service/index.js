require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cart');

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/cart', cartRoutes);


app.listen(port, () => {
    console.log(`Cart Service listening at http://localhost:${port}`);
});
