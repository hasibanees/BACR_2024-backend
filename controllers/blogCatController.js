import BlogCat from "../models/BlogCat.js";

// Function to create a new project
export const createCategory = async (req, res) => {
  const { name} = req.body;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const category = new BlogCat({
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
    const categories = await BlogCat.find(); // Fetch all categories
    console.log(categories); // Log categories to debug
    res.status(200).json({ categories });
  } catch (error) {
    console.error(error); // Log error for detailed debugging
    res.status(500).json({ message: "Error retrieving categories", error });
  }
};

// Function to get a single project by ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await BlogCat.findById(id);
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
    
    const updatedCategory = await BlogCat.findByIdAndUpdate(id, {name}, { new: true });
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
    const deleteCategory = await BlogCat.findByIdAndDelete(id);
    if (!deleteCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};
