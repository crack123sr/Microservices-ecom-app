

const { Kafka } = require('kafkajs');
const Transaction = require('../models/Transaction');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'payment-service',
    brokers
});


const consumer = kafka.consumer({ groupId: 'payment-group' });
const producer = kafka.producer();

const connectKafka = async () => {
    await producer.connect()
    await consumer.connect()
    console.log('Kafka Producer & Consumer Connected');

    await consumer.subscribe({ topic: 'order-created', fromBeginning: true })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const orderData = JSON.parse(message.value.toString());
            console.log(`Received Order: ${orderData._id}, Amount: ${orderData.totalAmount}`);

            const paymentStatus = orderData.totalAmount > 0 ? 'SUCCESS' : 'FAILED';


            const transaction = new Transaction({
                orderId: orderData._id,
                amount: orderData.totalAmount,
                status: paymentStatus
            });
            await transaction.save();
            console.log(`Transaction Saved: ${transaction._id} | Status: ${paymentStatus}`);



            // Send payment result event

            await producer.send({
                topic: 'payment-processed',
                messages: [
                    {
                        value: JSON.stringify({
                            orderId: orderData._id,
                            status: paymentStatus,
                            amount: orderData.totalAmount
                        })
                    }
                ]
            });



        }
    })
}

module.exports = { connectKafka };
