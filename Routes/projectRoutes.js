import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getSrno
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/project", createProject);         // Create a new project
router.get("/projects", getAllProjects);        // Get all projects
router.get("/project-getSrno", getSrno);        // Get all projects
router.get("/project/:id", getProjectById);     // Get a single project by ID
router.put("/project/:id", updateProject);      // Update a project by ID
router.delete("/project/:id", deleteProject);   // Delete a project by ID

export default router;
