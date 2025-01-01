import express from "express";
import RoleAccess from "../middleware/RoleAccess.js";
import Module from "../models/Module.js";

const router = express.Router();

// Protect routes with role-based access
router.get("/modules/:moduleName", RoleAccess("moduleName"), async (req, res) => {
  try {
    const module = await Module.findOne({ name: req.params.moduleName });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Add new module (admin-only access)
router.post("/modules", async (req, res) => {
  try {
    const { name, description } = req.body;
    const newModule = new Module({ name, description });
    await newModule.save();
    res.status(201).json({ message: "Module created", module: newModule });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

export default router;