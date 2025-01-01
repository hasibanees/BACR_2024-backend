import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true,unique:true },
},
{ timestamps: true } );
subscriberSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
export default mongoose.model("Subscriber", subscriberSchema);