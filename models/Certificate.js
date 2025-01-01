import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
  sr_no: { type: Number, required: true }, // Ensure unique serial numbers
  imagePath: { type: String}, // Path to the image file
  name: { type: String, required: true }, // Path to the image file
  issuedBy: { type: String, required: true }, // Path to the image file
  issuedDate: { type: Date, required: true }, // Path to the image file
}, { timestamps: true });

export default mongoose.model("Certificate", certificateSchema);