const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        index: true
    },
    stripeSessionId: {
        type: String,
        index: true
    },
    paymentIntentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'usd'
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
        required: true
    },
    customerEmail: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);

