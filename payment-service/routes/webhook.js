const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const { sendOrderEvent } = require('../config/kafka');

// Stripe Webhook Handler
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Payment successful for session:', session.id);

            try {
                // Parse items from metadata
                const items = JSON.parse(session.metadata.items || '[]');
                const total = parseFloat(session.metadata.total) || (session.amount_total / 100);

                // Create order in order-service
                const orderData = {
                    products: items.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    customerEmail: session.customer_email,
                    total: total,
                    stripeSessionId: session.id,
                    paymentStatus: 'PAID',
                    status: 'Confirmed'
                };

                // Call order-service to create order
                const orderResponse = await axios.post(
                    `${process.env.ORDER_SERVICE_URL}/orders/create-from-payment`,
                    orderData
                );

                console.log('Order created:', orderResponse.data._id);

                // Optionally send Kafka event
                if (sendOrderEvent) {
                    await sendOrderEvent({
                        ...orderResponse.data,
                        totalAmount: total
                    });
                }

            } catch (error) {
                console.error('Error creating order from webhook:', error.message);
            }
            break;

        case 'checkout.session.expired':
            console.log('Checkout session expired:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;
