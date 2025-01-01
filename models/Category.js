import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, // Path to the image file
},
{ timestamps: true } );

export default mongoose.model("Category", categorySchema);