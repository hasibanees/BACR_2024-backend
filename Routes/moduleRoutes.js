import express from "express";
import { getModules, createModule, updateModule, deleteModule } from "../controllers/ModuleController.js";

const router = express.Router();

// Route to fetch all modules
router.get("/modules", getModules);

// Route to create a new module
router.post("/module", createModule);
router.put('/module/:id', updateModule); // Update a module by ID
router.delete('/module/:id', deleteModule);
export default router;