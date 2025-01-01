import Tag from "../models/Tag.js";

// Function to create a new project
export const createTag = async (req, res) => {
  const { name} = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create the new project
    const tag = new Tag({
      name
    });
    await tag.save();
    res.status(201).json({ message: "Tag created successfully", tag });
  } catch (error) {
    res.status(500).json({ message: "Error saving tag", error });
  }
};

// Function to get all projects
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tags", error });
  }
};

// Function to get a single project by ID
export const getTagById = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ tag });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tag", error });
  }
};

// Function to update a tag by ID
export const updateTag = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    
    const updatedTag = await Tag.findByIdAndUpdate(id, {name}, { new: true });
    if (!updatedTag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ message: "Tag updated successfully", updatedTag });
  } catch (error) {
    res.status(500).json({ message: "Error updating tag", error });
  }
};

// Function to delete a project by ID
export const deleteTag = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteTag = await Tag.findByIdAndDelete(id);
    if (!deleteTag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tag", error });
  }
};