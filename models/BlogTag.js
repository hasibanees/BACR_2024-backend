import mongoose from "mongoose";

const blogTagSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Blog model
    ref: 'Blog',
    required: true,
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Tag model
    ref: 'Tag',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model("BlogTag", blogTagSchema);