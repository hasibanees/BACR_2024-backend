import mongoose from "mongoose";

const subbrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  newProd: { type: Number,default:0 },
  usedProd: { type: Number,default:0 },
  spPrt: { type: Number,default:0 },
},{ timestamps: true });

export default mongoose.model("SubBrand", subbrandSchema);