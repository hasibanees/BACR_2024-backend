import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  path: { type: String, required: true }, // Path of the image file
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Reference to the Project document
}, { timestamps: true });
export default mongoose.model("ProjectImages", imageSchema);