import mongoose from "mongoose"

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String},
  bio: { type: String, maxlength: 250 },
  email: { type: String,  unique: true },
  imagePath: { type: String}
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);