const mongoose = require('mongoose');
const path = require('path');
const Product = require('../models/Product');
const products = require('./products.json');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedProducts = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        await Product.bulkWrite(products.map((product) => ({
            updateOne: {
                filter: { name: product.name },
                update: { $set: product },
                upsert: true
            }
        })));
        console.log('Products seeded successfully');
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedProducts();