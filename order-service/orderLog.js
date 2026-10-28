const mongoose = require('mongoose');


const orderItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, default: 1 }
}, { _id: false });



const orderSchema = new mongoose.Schema({
    products: [orderItemSchema],
    totalAmount: Number,
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);