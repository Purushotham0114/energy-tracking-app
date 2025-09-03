import express from "express";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// MongoDB connection string (from .env)
const uri = process.env.MONGO_URI;
console.log(uri);
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

// GET /api/usage/stats
router.get("/stats", async (req, res) => {
    try {
        const dbClient = await getClient();
        const db = dbClient.db("energyDB");
        const collection = db.collection("energy_usage");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

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

// 📊 Hourly Usage (all data in collection)
router.get("/hourly", async (req, res) => {
    try {
        const client = await getClient();
        const db = client.db("energyDB");
        const collection = db.collection("energy_usage");

        const hourly = await collection
            .aggregate([
                {
                    $group: {
                        _id: "$hour_of_day",
                        usage: { $avg: "$energy_consumed" }, // avg makes sense across many days
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


// 📊 Daily Usage (last 30 days)
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


// 📊 Device Breakdown
router.get("/devices", async (req, res) => {
    try {
        const client = await getClient();
        const db = client.db("energyDB");
        const collection = db.collection("energy_usage");

        const devices = await collection
            .aggregate([
                {
                    $group: {
                        _id: "$device_id",
                        dailyUsage: { $sum: "$energy_consumed" },
                        currentUsage: { $last: "$energy_consumed" }, // use last value as "current"
                    },
                },
                {
                    $project: {
                        name: "$_id",
                        dailyUsage: 1,
                        currentUsage: 1,
                        _id: 0,
                    },
                },
                { $sort: { dailyUsage: -1 } },
                { $limit: 6 },
            ])
            .toArray();

        res.json(devices);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch devices" });
    }
});


export default router;
