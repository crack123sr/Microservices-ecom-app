const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [{
        productId: {
            type: String,  // Changed from ObjectId to String for Stripe flow compatibility
            required: true
        },
        name: String, // Snapshot
        price: Number, // Snapshot
        image: String, // Product image URL
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Confirmed', 'Cancelled']
    },
    paymentStatus: {
        type: String,
        default: 'PENDING',
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
    },
    stripeSessionId: {
        type: String,
        sparse: true
    },

    customerEmail: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
