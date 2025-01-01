import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/category", createCategory);         // Create a new category
router.get("/categories", getAllCategories);        // Get all categorys
router.get("/category/:id", getCategoryById);     // Get a single category by ID
router.put("/category/:id", updateCategory);      // Update a category by ID
router.delete("/category/:id", deleteCategory);   // Delete a category by ID

export default router;