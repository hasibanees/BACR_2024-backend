import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true , unique: true },
  sr_no: { type: Number, required: true},
  imagePath: { type: String}
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);