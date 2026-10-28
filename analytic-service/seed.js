require('dotenv').config();
const mongoose = require('mongoose');
const EventLog = require('./models/eventLog');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Analytic DB');
        const log = new EventLog({
            eventType: 'DB_INITIALIZATION',
            payload: { message: 'Database initialized successfully' }
        });
        await log.save();
        console.log('Successfully seeded Analytic DB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Analytic DB:', error);
        process.exit(1);
    }
};

seed();
