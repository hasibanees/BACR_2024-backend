import Department from "../models/Department.js";

// Function to create a new Department
export const createDepartment = async (req, res) => {
  const { name,email} = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const department = new Department({
      name,email
    });
    await department.save();
    res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    res.status(500).json({ message: "Error saving department", error });
  }
};

// Function to get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find(); // Fetch all departments
    res.status(200).json({ departments });
  } catch (error) {
    console.error(error); // Log error for detailed debugging
    res.status(500).json({ message: "Error retrieving departments", error });
  }
};

// Function to get a single project by ID
export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ department });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Department", error });
  }
};

// Function to update a department by ID
export const updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name,email } = req.body;
  try {
    
    const updatedDepartment = await Department.findByIdAndUpdate(id, {name,email}, { new: true });
    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department updated successfully", updatedDepartment });
  } catch (error) {
    res.status(500).json({ message: "Error updating department", error });
  }
};

// Function to delete a department by ID
export const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteDepartment = await Department.findByIdAndDelete(id);
    if (!deleteDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting department", error });
  }
};