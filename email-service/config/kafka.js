const { Kafka } = require('kafkajs');
const { Resend } = require('resend');
const EmailLog = require('../models/EmailLog');

// Initialize Kafka client
const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'email-service',
    brokers
});

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789'); // Valid key required in env

const consumer = kafka.consumer({ groupId: 'email-service' });
const producer = kafka.producer();

const connectKafka = async () => {
    try {
        await producer.connect();
        await consumer.connect();
        console.log('✅ Email Service Kafka Consumer & Producer connected');

        // Subscribe to topics
        await consumer.subscribe({ topic: 'order-created', fromBeginning: false });
        await consumer.subscribe({ topic: 'payment-processed', fromBeginning: false });

        console.log('📥 Email Service subscribed to: order-created, payment-processed');

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const eventData = JSON.parse(message.value.toString());
                console.log(`📨 Email Service received ${topic} event`);

                switch (topic) {
                    case 'order-created':
                        await sendOrderConfirmationEmail(eventData);
                        break;
                    case 'payment-processed':
                        await sendPaymentStatusEmail(eventData);
                        break;
                    default:
                        console.log(`Unknown topic: ${topic}`);
                }
            }
        });
    } catch (error) {
        console.error('❌ Error connecting Email Service Consumer:', error);
    }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData) => {
    try {
        const recipient = orderData.customerEmail || 'default@example.com';
        const orderId = orderData.orderId || orderData._id;
        const subject = `🎉 Order Confirmed - #${String(orderId).slice(-8).toUpperCase()}`;

        // Build product rows HTML
        const products = orderData.products || [];
        const productRows = products.map(product => `
            <tr>
                <td style="padding: 16px; border-bottom: 1px solid #eee;">
                    <div style="display: flex; align-items: center;">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 16px;">` : `<div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 8px; margin-right: 16px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">📦</div>`}
                        <div>
                            <p style="margin: 0; font-weight: 600; color: #1f2937;">${product.name || 'Product'}</p>
                            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Qty: ${product.quantity || 1}</p>
                        </div>
                    </div>
                </td>
                <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #1f2937;">
                    $${((product.price || 0) * (product.quantity || 1)).toFixed(2)}
                </td>
            </tr>
        `).join('');

        const total = orderData.totalAmount || orderData.totalPrice || 0;
        const subtotal = (total / 1.1).toFixed(2); // Assuming 10% tax
        const tax = (total - subtotal).toFixed(2);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Order Confirmed! 🎉</h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for your purchase</p>
                        </td>
                    </tr>
                    
                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Number</p>
                                        <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 18px; font-weight: 700;">#${String(orderId).slice(-8).toUpperCase()}</p>
                                    </td>
                                    <td style="text-align: right;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">Order Date</p>
                                        <p style="margin: 4px 0 0 0; color: #1f2937; font-size: 16px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Products -->
                    <tr>
                        <td style="padding: 0 30px;">
                            <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Order Items</h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${productRows || '<tr><td style="padding: 16px; color: #6b7280;">No items</td></tr>'}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 30px;">
                            <table width="100%" style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
                                    <td style="padding: 8px 0; text-align: right; color: #1f2937;">$${subtotal}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Tax</td>
                                    <td style="padding: 8px 0; text-align: right; color: #1f2937;">$${tax}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
                                    <td style="padding: 8px 0; text-align: right; color: #10b981; font-weight: 600;">FREE</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="border-top: 2px solid #e5e7eb; padding-top: 16px;"></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700;">Total</td>
                                    <td style="padding: 8px 0; text-align: right; color: #667eea; font-size: 24px; font-weight: 700;">$${Number(total).toFixed(2)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA -->
                    <tr>
                        <td style="padding: 0 30px 30px; text-align: center;">
                            <a href="http://localhost:3000/orders" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View My Orders</a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 14px;">Questions? Contact us at support@ecommerce.com</p>
                            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">© ${new Date().getFullYear()} Ecommerce. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        console.log(`📧 Sending order confirmation to: ${recipient}`);

        let emailStatus = 'sent';
        try {
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: recipient,
                    subject: subject,
                    html: html
                });
                console.log(`✅ Email sent via Resend to ${recipient}`);
            } else {
                console.log('⚠️ RESEND_API_KEY missing, skipping actual send');
            }
        } catch (emailError) {
            console.error('❌ Failed to send email via Resend:', emailError);
            emailStatus = 'failed';
        }

        // Log to DB
        const emailLog = new EmailLog({
            recipient,
            subject,
            body: html,
            status: emailStatus,
            eventType: 'order-created'
        });

        await emailLog.save();
        console.log('✅ Order confirmation email logged');

        // Produce email-successful event
        if (emailStatus === 'sent') {
            await producer.send({
                topic: 'email-successful',
                messages: [
                    { value: JSON.stringify({ emailId: emailLog._id, recipient, eventType: 'order-created' }) }
                ]
            });
            console.log('📤 Produced email-successful event');
        }

    } catch (error) {
        console.error('❌ Error processing order confirmation:', error);
    }
};


// Send payment status email
const sendPaymentStatusEmail = async (paymentData) => {
    try {
        const recipient = paymentData.customerEmail || 'default@example.com'; // Dynamic recipient
        const subject = `Payment Update - ${paymentData.orderId}`;
        const status = paymentData.status === 'SUCCESS' ? 'Successful' : 'Failed';
        const html = `<p>Your payment for order <strong>${paymentData.orderId}</strong> was <strong>${status}</strong>.</p><p>Amount: $${paymentData.amount}</p>`;

        console.log(`📧 Sending payment update to: ${recipient}`);

        let emailStatus = 'sent';
        try {
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'onboarding@resend.dev',
                    to: recipient,
                    subject: subject,
                    html: html
                });
                console.log(`✅ Email sent via Resend to ${recipient}`);
            } else {
                console.log('⚠️ RESEND_API_KEY missing, skipping actual send');
            }
        } catch (emailError) {
            console.error('❌ Failed to send email via Resend:', emailError);
            emailStatus = 'failed';
        }

        // Log to DB
        const emailLog = new EmailLog({
            recipient,
            subject,
            body: html,
            status: emailStatus,
            eventType: 'payment-processed'
        });

        await emailLog.save();
        console.log('✅ Payment status email logged');

        // Produce email-successful event
        if (emailStatus === 'sent') {
            await producer.send({
                topic: 'email-successful',
                messages: [
                    { value: JSON.stringify({ emailId: emailLog._id, recipient, eventType: 'payment-processed' }) }
                ]
            });
            console.log('📤 Produced email-successful event');
        }

    } catch (error) {
        console.error('❌ Error processing payment status:', error);
    }
};

module.exports = { connectKafka };
