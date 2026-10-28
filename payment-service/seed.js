require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Payment DB');
        const transaction = new Transaction({
            orderId: 'init-seed-order',
            amount: 0,
            status: 'SUCCESS'
        });
        await transaction.save();
        console.log('Successfully seeded Payment DB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Payment DB:', error);
        process.exit(1);
    }
};

seed();
