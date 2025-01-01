import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Path to the image file
  email: { type: String, required: true }, // Path to the image file
},
{ timestamps: true } );

export default mongoose.model("Department", departmentSchema);