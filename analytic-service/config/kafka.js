

const { Kafka } = require('kafkajs');
const EventLog = require('../models/eventLog');

const brokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const kafka = new Kafka({
    clientId: 'order-service',
    brokers

})


const consumer = kafka.consumer({ groupId: 'analytic-service' });


const connectKafka = async () => {
    await consumer.connect()
    console.log('Analytic Service Kafka Connected');

    await consumer.subscribe({ topic: 'order-created', fromBeginning: true });
    await consumer.subscribe({ topic: 'payment-processed', fromBeginning: true });
    await consumer.subscribe({ topic: 'email-successful', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const data = JSON.parse(message.value.toString());
            console.log(`ANALYTIC EVENT [${topic}]:`, data);

            const event = new EventLog({
                eventType: topic,
                payload: data
            });
            await event.save();
            console.log('Analytics Event Saved');


        }
    })

}


module.exports = { connectKafka };
