const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const axios = require('axios');
const { sendOrderEvent } = require('../config/kafka');

// Create order (manual flow - validates with product service)
router.post("/create-order", async (req, res) => {
    try {
        const { products, customerEmail } = req.body;

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({ error: 'No products provided' });
        }

        const validProducts = [];
        let calculatedTotal = 0;

        for (const item of products) {
            try {
                const response = await axios.get(`http://localhost:3002/products/${item.productId}`);
                const product = response.data;

                if (!product) {
                    return res.status(404).json({ error: `Product ${item.productId} not found` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ error: `Product ${product.name} is out of stock` });
                }

                validProducts.push({
                    productId: product._id.toString(),
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity
                });
                calculatedTotal += product.price * item.quantity;

            } catch (error) {
                console.error(`Error fetching product ${item.productId}:`, error.message);
                return res.status(500).json({ error: `Failed to validate product ${item.productId}` });
            }
        }

        const order = new Order({
            products: validProducts,
            total: calculatedTotal,
            customerEmail: customerEmail
        });

        await order.save();
        res.status(201).json(order);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create order from payment (Stripe flow - from checkout success)
router.post("/create-from-payment", async (req, res) => {
    try {
        const { products, customerEmail, total, stripeSessionId, paymentStatus, status, userId } = req.body;

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required' });
        }

        // Check if order already exists for this session
        const existingOrder = await Order.findOne({ stripeSessionId });
        if (existingOrder) {
            console.log('Order already exists for session:', stripeSessionId);
            return res.json(existingOrder);
        }

        const order = new Order({
            products: products.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image || '',
                quantity: item.quantity
            })),
            total,
            customerEmail,
            stripeSessionId,
            paymentStatus: paymentStatus || 'PAID',
            status: status || 'Confirmed',
            userId
        });

        await order.save();
        console.log('Order created from payment:', order._id);

        // Send Kafka event for email notification
        try {
            await sendOrderEvent({
                orderId: order._id,
                customerEmail: order.customerEmail,
                totalAmount: order.total,
                products: order.products,
                status: order.status
            });
            console.log('Order event sent to Kafka');
        } catch (kafkaError) {
            console.error('Failed to send Kafka event:', kafkaError.message);
        }

        res.status(201).json(order);

    } catch (error) {
        console.error('Error creating order from payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get order by Stripe session ID
router.get("/session/:sessionId", async (req, res) => {
    try {
        const order = await Order.findOne({ stripeSessionId: req.params.sessionId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

