import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// MongoDB connection string (from .env)
const uri = process.env.MONGO_URI;
let client;

// Reuse a single client
async function getClient() {
    if (!client) {
        if (!uri) {
            throw new Error("❌ MONGO_URI is not defined. Check your .env file.");
        }
        client = new MongoClient(uri);
        await client.connect();
        console.log("✅ Connected to MongoDB");
    }
    return client;
}



router.get("/stats", async (req, res) => {
    try {
        const dbClient = await getClient();
        const db = dbClient.db("energyDB");
        const collection = db.collection("energy_usage");

        // ========================
        // 📅 Date Ranges
        // ========================
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        // ========================
        // 🔎 Aggregations
        // ========================
        const todayUsage = await collection.aggregate([
            { $match: { timestamp: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
        ]).toArray();

        const weekUsage = await collection.aggregate([
            { $match: { timestamp: { $gte: weekAgo, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
        ]).toArray();

        const monthUsage = await collection.aggregate([
            { $match: { timestamp: { $gte: monthAgo, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
        ]).toArray();

        // ========================
        // 📤 Response
        // ========================
        res.json({
            today: todayUsage[0]?.total || 0,
            week: weekUsage[0]?.total || 0,
            month: monthUsage[0]?.total || 0,
        });

    } catch (err) {
        console.error("❌ Error in /stats route:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// 📊 Hourly Usage
// GET /api/usage/hourly?date=YYYY-MM-DD
router.get("/hourly", async (req, res) => {
    try {
        const client = await getClient();
        const db = client.db("energyDB");
        const collection = db.collection("energy_usage");

        // pick date (or default latest date in DB)
        let queryDate;
        if (req.query.date) {
            queryDate = new Date(req.query.date);
        } else {
            const latestDoc = await collection
                .find({})
                .sort({ date: -1 })
                .limit(1)
                .toArray();
            queryDate = latestDoc[0].date;
        }

        const hourly = await collection
            .aggregate([
                { $match: { date: queryDate } },
                {
                    $group: {
                        _id: "$hour_of_day",
                        usage: { $sum: "$energy_consumed" },
                    },
                },
                { $sort: { _id: 1 } },
                {
                    $project: {
                        hour: "$_id",
                        usage: 1,
                        _id: 0,
                    },
                },
            ])
            .toArray();

        res.json(hourly);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch hourly usage" });
    }
});

// 📊 Daily Usage
router.get("/daily", async (req, res) => {
    try {
        const client = await getClient();
        const db = client.db("energyDB");
        const collection = db.collection("energy_usage");

        const daily = await collection
            .aggregate([
                {
                    $group: {
                        _id: {
                            day: { $dayOfMonth: "$date" },
                            month: { $month: "$date" },
                            year: { $year: "$date" },
                        },
                        usage: { $sum: "$energy_consumed" },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
                {
                    $project: {
                        date: {
                            $concat: [
                                { $toString: "$_id.day" },
                                "/",
                                { $toString: "$_id.month" },
                            ],
                        },
                        usage: 1,
                        _id: 0,
                    },
                },
            ])
            .toArray();

        res.json(daily);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch daily usage" });
    }
});

// 📊 Device Breakdown with cumulative slots
// GET /api/usage/devices?date=YYYY-MM-DD
router.get("/devices", async (req, res) => {
    try {
        const client = await getClient();
        const db = client.db("energyDB");
        const collection = db.collection("energy_usage");

        let startDate, endDate;
        if (req.query.date) {
            const parsed = new Date(req.query.date);
            if (isNaN(parsed.getTime())) {
                return res
                    .status(400)
                    .json({ error: "Invalid date format. Use YYYY-MM-DD" });
            }
            startDate = new Date(
                Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
            );
            endDate = new Date(startDate);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
        } else {
            const latest = await collection
                .find({ date: { $exists: true } })
                .sort({ date: -1 })
                .limit(1)
                .toArray();
            if (!latest.length) return res.json([]);
            const d = new Date(latest[0].date);
            startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
            endDate = new Date(startDate);
            endDate.setUTCDate(endDate.getUTCDate() + 1);
        }

        const pipeline = [
            { $match: { date: { $gte: startDate, $lt: endDate } } },
            {
                $group: {
                    _id: { device: "$device_id", ts: "$timestamp" },
                    slotUsage: { $sum: "$energy_consumed" },
                },
            },
            { $sort: { "_id.device": 1, "_id.ts": 1 } },
            {
                $group: {
                    _id: "$_id.device",
                    slots: { $push: { timestamp: "$_id.ts", usage: "$slotUsage" } },
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    slots: {
                        $map: {
                            input: { $range: [0, { $size: "$slots" }] },
                            as: "idx",
                            in: {
                                timestamp: { $arrayElemAt: ["$slots.timestamp", "$$idx"] },
                                cumulative: {
                                    $sum: { $slice: ["$slots.usage", 0, { $add: ["$$idx", 1] }] },
                                },
                            },
                        },
                    },
                },
            },
            { $sort: { name: 1 } },
        ];

        const devices = await collection.aggregate(pipeline).toArray();

        res.json(devices);
    } catch (err) {
        console.error("Error in /devices:", err);
        res.status(500).json({ error: "Failed to fetch devices cumulative usage" });
    }
});

export default router;
