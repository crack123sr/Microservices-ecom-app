require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectKafka } = require('./config/kafka');
const checkoutRoutes = require('./routes/checkout');
const webhookRoutes = require('./routes/webhook');

const app = express();
const port = 3006;

// CORS
app.use(cors({ origin: 'http://localhost:3000' }));

// Webhook route needs raw body - must be before express.json()
app.use('/webhook', webhookRoutes);

// Parse JSON for other routes
app.use(express.json());

// Connect to DB and Kafka
connectDB();
connectKafka().catch(console.error);

// Routes
app.use('/checkout', checkoutRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'payment-service' });
});

app.listen(port, () => {
    console.log(`Payment Service listening at http://localhost:${port}`);
});
