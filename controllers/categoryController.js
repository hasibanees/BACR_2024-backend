import Category from "../models/Category.js";

// Function to create a new project
export const createCategory = async (req, res) => {
  const { name} = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create the new project
    const category = new Category({
      name
    });
    await category.save();
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Error saving category", error });
  }
};

// Function to get all projects
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving categories", error });
  }
};

// Function to get a single project by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving category", error });
  }
};

// Function to update a category by ID
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    
    const updatedCategory = await Category.findByIdAndUpdate(id, {name}, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category updated successfully", updatedCategory });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

// Function to delete a project by ID
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteCategory = await Category.findByIdAndDelete(id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
