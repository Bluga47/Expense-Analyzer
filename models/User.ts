
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  theme: { type: String, default: 'light' },
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
