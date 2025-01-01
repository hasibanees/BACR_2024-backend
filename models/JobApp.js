import mongoose from "mongoose";

const jobappSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String }, 
  email: { type: String }, 
  resume: { type: String }, 
  category: { 
    type: String, 
    enum: ['job', 'career'], 
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
},
{ timestamps: true } );

export default mongoose.model("JobApp", jobappSchema);