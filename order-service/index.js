require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectKafka } = require('./config/kafka');
const orderRoutes = require('./routes/orders');

const app = express();
const port = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB and Kafka Producer
connectDB();
connectKafka().catch(console.error);

// Routes
app.use('/orders', orderRoutes);

app.listen(port, () => {
    console.log(`Order Service listening at http://localhost:${port}`);
});