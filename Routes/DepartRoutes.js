import express from "express";
import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from "../controllers/departmentController.js";

const router = express.Router();

router.post("/department", createDepartment);         // Create a new department
router.get("/departments", getAllDepartments);        // Get all departments
router.get("/department/:id", getDepartmentById);     // Get a single department by ID
router.put("/department/:id", updateDepartment);      // Update a department by ID
router.delete("/department/:id", deleteDepartment);   // Delete a department by ID

export default router;