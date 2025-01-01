import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String},
  phone: { type: Number},
  date: { type: String, required: true },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

appointmentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1 * 24 * 60 * 60 });
export default mongoose.model('Appointment', appointmentSchema);