import express from "express";
import {
  createBlog,
  getAllBlogs,
  getAllBlogsUrl,
  getAllBlogsBack,
  getBlogById,
  updateBlog,
  deleteBlog,
  getRelatedBlogs
} from "../controllers/blogController.js";

const router = express.Router();

router.post("/blog", createBlog);           // Create a new blog
router.get("/blogs", getAllBlogs);   
router.get("/blogs-url", getAllBlogsUrl);         // Get all blogs
router.get("/blogsall", getAllBlogsBack);          // Get all blogs
router.get("/blog/:id", getBlogById);       // Get a single blog by ID
router.get("/related-blogs/:id", getRelatedBlogs);       // Get a single blog by ID
router.put("/blog/:id", updateBlog);        // Update a blog by ID
router.delete("/blog/:id", deleteBlog);     // Delete a blog by ID
// jjjjj
export default router;