import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  path: { type: String, required: true }, // Path of the image file
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Reference to the product document
}, { timestamps: true });
export default mongoose.model("ProductImages", imageSchema);