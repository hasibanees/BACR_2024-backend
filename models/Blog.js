import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true },
  alt_text: { type: String },
  meta_desc: { type: String },
  meta_title: { type: String },
  caption_img: { type: String },
  imagePath: { type: String, required: true },
  emails: { type: String },
  can_url: { type: String },
  focus_keys: { type: String },
  soc_tags: { type: String },
  excerpt: { type: String },
  status:  { 
    type: String, 
    enum: ['schedule', 'publish','draft'], 
  },
  schedule_time:  { 
    type: Date,
    allowNull: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Category model
    ref: 'BlogCat', // Reference to the Category model
    required: true, // Ensures that a category is linked
  }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);