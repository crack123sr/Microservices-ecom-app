require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const app = express();
const port = 3002;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Add body parser just in case

const productRoutes = require('./routes/products');
app.use('/products', productRoutes);

connectDB();


app.listen(port, () => {
    console.log(`Product Service listening at http://localhost:${port}`);
});