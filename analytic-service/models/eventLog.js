const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
    eventType: String, // 'ORDER_CREATED', 'PAYMENT_PROCESSED'
    payload: Object, // Store the entire message payload
    occurredAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('EventLog', eventLogSchema);
