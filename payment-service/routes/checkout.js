const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Create Stripe Checkout Session
router.post('/create-session', async (req, res) => {
    try {
        const { items, customerEmail, userId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        // Calculate total for metadata
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
            customer_email: customerEmail,
            metadata: {
                userId: userId || 'guest',
                items: JSON.stringify(items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || ''
                }))),
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                total: total.toFixed(2)
            }
        });

        res.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get session details and create order if payment is successful
router.get('/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'payment_intent']
        });

        // If payment was successful, create the order and save transaction
        if (session.payment_status === 'paid') {
            let orderId = null;

            try {
                // Check if order already exists
                const existingOrder = await axios.get(
                    `${process.env.ORDER_SERVICE_URL}/orders/session/${sessionId}`
                ).catch(() => null);

                if (!existingOrder || !existingOrder.data || existingOrder.data.error) {
                    // Parse items from metadata
                    const items = JSON.parse(session.metadata.items || '[]');
                    const total = parseFloat(session.metadata.total) || (session.amount_total / 100);

                    // Create order in order-service
                    const orderData = {
                        products: items.map(item => ({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image || ''
                        })),
                        customerEmail: session.customer_email,
                        total: total,
                        stripeSessionId: session.id,
                        paymentStatus: 'PAID',
                        status: 'Confirmed',
                        userId: session.metadata.userId
                    };

                    const orderResponse = await axios.post(
                        `${process.env.ORDER_SERVICE_URL}/orders/create-from-payment`,
                        orderData
                    );
                    orderId = orderResponse.data._id;
                    console.log('Order created for session:', sessionId);
                } else {
                    orderId = existingOrder.data._id;
                }

                // Save transaction to payment-db (if not already saved)
                const existingTransaction = await Transaction.findOne({ orderId: sessionId });
                if (!existingTransaction && orderId) {
                    const transaction = new Transaction({
                        orderId: orderId,
                        stripeSessionId: sessionId,
                        amount: session.amount_total / 100,
                        currency: session.currency,
                        status: 'SUCCESS',
                        customerEmail: session.customer_email,
                        paymentIntentId: session.payment_intent?.id || session.payment_intent
                    });
                    await transaction.save();
                    console.log('Transaction saved:', transaction._id);
                }

            } catch (orderError) {
                console.error('Error creating order:', orderError.message);
            }
        }

        res.json({
            id: session.id,
            customerEmail: session.customer_email,
            paymentStatus: session.payment_status,
            amountTotal: session.amount_total / 100,
            currency: session.currency,
            metadata: session.metadata,
            lineItems: session.line_items?.data || [],
            createdAt: new Date(session.created * 1000)
        });
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

