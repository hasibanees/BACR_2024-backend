import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Path to the image file
},
{ timestamps: true } );

export default mongoose.model("Tag", tagSchema);