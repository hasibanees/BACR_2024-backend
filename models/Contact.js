import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String},
  phone: { type: Number},
  message: { type: String},
}, { timestamps: true }); // Adds createdAt and updatedAt fields

contactSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1 * 24 * 60 * 60 });
export default mongoose.model('Contact', contactSchema);