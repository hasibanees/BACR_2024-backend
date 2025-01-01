import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String },
  website: { type: String },
  category: { type: String },
  image: { type: String },
  coverimage: { type: String },
  newProd: { type: Number,default:0 },
  usedProd: { type: Number,default:0 },
  spPrt: { type: Number,default:0 },
  authorize: { type: Number,default:0 },
}, { timestamps: true });

export default mongoose.model("Brand", brandSchema);
