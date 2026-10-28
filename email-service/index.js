require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');


const app = express();
const port = 3004;

const { connectKafka } = require('./config/kafka');

app.use(cors({ origin: 'http://localhost:3000' }));
connectDB();
connectKafka();


app.listen(port, () => {
    console.log(`Email Service listening at http://localhost:${port}`);
});