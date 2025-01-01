import mongoose from "mongoose";

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }, 
  email: { type: String }, 
  resume: { type: String }, 
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
},
{ timestamps: true } );

export default mongoose.model("Career", careerSchema);