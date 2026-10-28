
const { Kafka } = require('kafkajs');
const Order = require('../models/Order');


// 1. Order Service creates order (status: PENDING)
//                 ↓
// 2. Order Service PRODUCES "order-created"
//                 ↓
// 3. Payment Service hears it and processes payment
//                 ↓
// 4. Payment Service PRODUCES "payment-processed" (SUCCESS/FAILED)
//                 ↓
// 5. Order Service CONSUMES "payment-processed"
//                 ↓
// 6. Order Service updates its own order (PAID or CANCELLED)

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'order-service',
    brokers

})

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'order-service' });


const connectKafka = async () => {
    await producer.connect()
    await consumer.connect()
    console.log('Kafka Producer & Consumer Connected');


    await consumer.subscribe({ topic: 'payment-processed', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log(`Received Payment Event: ${data.status} for Order ${data.orderId}`);


            const newStatus = data.status === 'SUCCESS' ? 'PAID' : 'CANCELLED';


            await Order.findByIdAndUpdate(data.orderId, { status: newStatus }, { new: true })

            console.log(`Order ${data.orderId} updated to ${newStatus}`);


        }
    })
}
const sendOrderEvent = async (order) => {
    await producer.send({
        topic: 'order-created',
        messages: [
            { value: JSON.stringify(order) }
        ]
    });
}



module.exports = { connectKafka, sendOrderEvent };









