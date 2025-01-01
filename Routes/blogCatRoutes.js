import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/blogCatController.js";

const router = express.Router();

router.post("/blog/category", createCategory);         // Create a new category
router.get("/blog-categories", getAllCategories);        // Get all categorys
router.get("/blog/category/:id", getCategoryById);     // Get a single category by ID
router.put("/blog/category/:id", updateCategory);      // Update a category by ID
router.delete("/blog/category/:id", deleteCategory);   // Delete a category by ID

export default router;