import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  client: { type: String, required: true },
  category: { type: String},
  description: { type: String, required: true },
  sr_no: { type: Number,  required: true },
  mainimage : { type: String},
  logo : { type: String},
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
