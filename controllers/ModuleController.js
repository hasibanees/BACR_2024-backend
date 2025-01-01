import Module from "../models/Module.js";

export const getModules = async (req, res) => {
  try {
    const modules = await Module.find();
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching modules", error });
  }
};

export const createModule = async (req, res) => {
  const { name, description} = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Module name is required' });
  }
  try {
    const newModule = new Module({ name, description});
    await newModule.save();
    res.status(201).json({ message: 'Module created successfully', module: newModule });
  } catch (error) {
    res.status(500).json({ message: 'Error creating module', error });
  }
};

export const updateModule = async (req, res) => {
  const { id } = req.params; // Assuming the module ID is passed as a URL parameter
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Module name is required' });
  }

  try {
    // Find the module by ID and update it
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { name, description },
      { new: true } // Return the updated module
    );

    if (!updatedModule) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.status(200).json({ message: 'Module updated successfully', module: updatedModule });
  } catch (error) {
    res.status(500).json({ message: 'Error updating module', error });
  }
};

// Delete a module
export const deleteModule = async (req, res) => {
  const { id } = req.params; // Assuming the module ID is passed as a URL parameter

  try {
    // Find and remove the module by ID
    const deletedModule = await Module.findByIdAndDelete(id);

    if (!deletedModule) {
      return res.status(404).json({ message: 'Module not found' });
    }

    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting module', error });
  }
};