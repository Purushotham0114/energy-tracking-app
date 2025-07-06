import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['AC', 'TV', 'Heater', 'Fridge', 'Washing Machine', 'Microwave', 'Lights', 'Other']
  },
  wattage: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    default: 'Living Room'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Device', deviceSchema);