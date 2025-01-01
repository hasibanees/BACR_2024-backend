import mongoose from "mongoose"

const teamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String },
  desc: { type: String},
  type:  { 
    type: String, 
    enum: ['fulltime', 'parttime'], 
  },
  responsb: { type: String},
  skills: { type: String},
  designation: { type: String},
  requirements: { type: String },
  deadline: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, required: true },
  department: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Category model
    ref: 'Department', // Reference to the Category model
    required: true, // Ensures that a category is linked
  },
}, { timestamps: true });

export default mongoose.model('Job', teamSchema);