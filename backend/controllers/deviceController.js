import Device from '../models/Device.js';
import EnergyUsage from '../models/EnergyUsage.js';
import moment from 'moment';
import dotenv from "dotenv";
dotenv.config();


// ------------------ GET DEVICES ------------------
// Fetch devices with usage stats (supports ?date=YYYY-MM-DD)

import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
let client;

// ✅ Reuse a single MongoDB client connection
export async function getClient() {
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

// ✅ Controller: Fetch device stats directly from energyDB.energy_usage
export const getDevices = async (req, res) => {
  try {
    const client = await getClient();
    const db = client.db("energyDB");
    const collection = db.collection("energy_usage");

    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
    }

    const targetDate = moment(date, "YYYY-MM-DD");
    const startOfDay = targetDate.clone().startOf("day").toDate();
    const endOfDay = targetDate.clone().endOf("day").toDate();
    const startOfWeek = targetDate.clone().startOf("week").toDate();
    const startOfMonth = targetDate.clone().startOf("month").toDate();

    // ✅ Get all unique device names in DB
    const deviceNames = await collection.distinct("device_id");

    const results = await Promise.all(
      deviceNames.map(async (deviceName) => {
        // Parallel queries for performance
        const [dailyAgg, weeklyAgg, monthlyAgg, latestUsage] = await Promise.all([
          collection
            .aggregate([
              { $match: { device_id: deviceName, date: { $gte: startOfDay, $lte: endOfDay } } },
              { $group: { _id: null, total: { $sum: "$energy_consumed" } } },
            ])
            .toArray(),

          collection
            .aggregate([
              { $match: { device_id: deviceName, date: { $gte: startOfWeek, $lte: endOfDay } } },
              { $group: { _id: null, total: { $sum: "$energy_consumed" } } },
            ])
            .toArray(),

          collection
            .aggregate([
              { $match: { device_id: deviceName, date: { $gte: startOfMonth, $lte: endOfDay } } },
              { $group: { _id: null, total: { $sum: "$energy_consumed" } } },
            ])
            .toArray(),

          collection.findOne(
            { device_id: deviceName, date: { $lte: endOfDay } },
            { sort: { date: -1 } } // ✅ Correct sort syntax
          ),
        ]);

        return {
          id: deviceName,
          name: deviceName,
          category: deviceName,
          location: "-", // optional, you can map locations if available
          status: latestUsage?.device_on_flag ? "on" : "off",
          efficiency: latestUsage?.device_load_category?.toLowerCase() || "medium",
          currentUsage: latestUsage?.energy_consumed || 0,
          dailyUsage: dailyAgg[0]?.total || 0,
          weeklyUsage: weeklyAgg[0]?.total || 0,
          monthlyUsage: monthlyAgg[0]?.total || 0,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error("❌ Get devices error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ------------------ CREATE DEVICE ------------------
export const createDevice = async (req, res) => {
  try {
    const { name, type, wattage, location } = req.body;

    const device = new Device({
      userId: req.session.userId,
      name,
      type,
      wattage,
      location,
      isActive: true // default active
    });

    await device.save();
    res.status(201).json(device);
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------ UPDATE DEVICE ------------------
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, wattage, location, isActive } = req.body;

    const device = await Device.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      { name, type, wattage, location, isActive },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ------------------ DELETE DEVICE ------------------
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOneAndDelete({
      _id: id,
      userId: req.session.userId
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Remove all related energy usage records
    await EnergyUsage.deleteMany({ deviceId: id });

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
