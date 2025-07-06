import Device from '../models/Device.js';
import EnergyUsage from '../models/EnergyUsage.js';

export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.session.userId });
    res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createDevice = async (req, res) => {
  try {
    const { name, type, wattage, location } = req.body;

    const device = new Device({
      userId: req.session.userId,
      name,
      type,
      wattage,
      location
    });

    await device.save();
    res.status(201).json(device);
  } catch (error) {
    console.error('Create device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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

    // Also delete all energy usage records for this device
    await EnergyUsage.deleteMany({ deviceId: id });

    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};