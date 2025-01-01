import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sr_no: { type: Number, required: true},
  sr_nop: { type: String, required: true, unique: true },
  model: { type: String },
  price: { type: Number },
  capacity: { type: Number },
  quantity: { type: Number },
  part: { type: String },
  aval:  { 
    type: String, 
    enum: ['instock', 'outofstock','inorder'], 
  },
  detail: { type: String },
  imagePath: { type: String },
  logo: { type: String },
  proType: { type: String },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Category model
    ref: 'Category', // Reference to the Category model
    required: true, // Ensures that a category is linked
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Brand model
    ref: 'Brand', // Reference to the Brand model
    required: true, // Ensures that a Brand is linked
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema)