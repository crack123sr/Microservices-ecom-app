const express = require('express');
const router = express.Router();
const EventLog = require('../models/EventLog');

// Get all analytics
router.get('/analytics', async (req, res) => {
    try {
        const analytics = await EventLog.find();
        res.json(analytics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET statistics (Aggregation Example)
router.get('/stats', async (req, res) => {
    try {
        const stats = await EventLog.aggregate([
            {
                $group: {
                    _id: "$eventType",
                    count: { $sum: 1 },
                    lastOccurred: { $max: "$occurredAt" }
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
