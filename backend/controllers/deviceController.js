import Device from '../models/Device.js';
import EnergyUsage from '../models/EnergyUsage.js';
import moment from 'moment';

// ------------------ GET DEVICES ------------------
// Fetch devices with usage stats (supports ?date=YYYY-MM-DD)
export const getDevices = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { date } = req.query; // optional ?date=YYYY-MM-DD

    // Default to today if no date is provided
    const targetDate = date ? moment(date, 'YYYY-MM-DD') : moment();
    const startOfDay = targetDate.clone().startOf('day').toDate();
    const endOfDay = targetDate.clone().endOf('day').toDate();

    const startOfWeek = targetDate.clone().startOf('week').toDate();
    const startOfMonth = targetDate.clone().startOf('month').toDate();

    // Fetch devices owned by the user
    const devices = await Device.find({ userId });

    // Attach usage stats to each device
    const result = await Promise.all(
      devices.map(async (device) => {
        const [dailyAgg, weeklyAgg, monthlyAgg, latestUsage] = await Promise.all([
          EnergyUsage.aggregate([
            { $match: { deviceId: device._id, date: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
          ]),
          EnergyUsage.aggregate([
            { $match: { deviceId: device._id, date: { $gte: startOfWeek, $lte: endOfDay } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
          ]),
          EnergyUsage.aggregate([
            { $match: { deviceId: device._id, date: { $gte: startOfMonth, $lte: endOfDay } } },
            { $group: { _id: null, total: { $sum: "$energy_consumed" } } }
          ]),
          EnergyUsage.findOne({ deviceId: device._id, date: { $lte: endOfDay } })
            .sort({ timestamp: -1 })
        ]);

        return {
          id: device._id,
          name: device.name,
          category: device.type,
          location: device.location,
          status: device.isActive ? 'on' : 'off',
          efficiency: device.efficiency || 'medium',
          currentUsage: latestUsage?.energy_consumed || 0,
          dailyUsage: dailyAgg[0]?.total || 0,
          weeklyUsage: weeklyAgg[0]?.total || 0,
          monthlyUsage: monthlyAgg[0]?.total || 0
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ message: 'Server error' });
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
