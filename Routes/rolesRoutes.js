import express from "express";
import User from "../models/User.js";
import Module from "../models/Module.js";
import Role from "../models/Role.js";
import { getRoleById, getRoles } from "../controllers/rolesController.js";

const router = express.Router();

// Assign role to a user
router.get("/roles", getRoles);
router.get("/role/:id", getRoleById);
router.put('/role/:roleId/add-modules', async (req, res) => {
  const { roleId } = req.params; // Get the role ID from the URL params
  const { moduleIds } = req.body; // Assume an array of module IDs is sent in the body

  if (!moduleIds || moduleIds.length === 0) {
    return res.status(400).json({ message: 'Please provide at least one module ID.' });
  }

  try {
    // Find the role by ID
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({ message: 'Role not found.' });
    }

    // Check if the modules exist in the database
    const modules = await Module.find({ '_id': { $in: moduleIds } });

    if (modules.length !== moduleIds.length) {
      return res.status(400).json({ message: 'One or more module IDs are invalid.' });
    }

    // Add the modules to the role if they aren't already present
    role.modules = role.modules.filter(moduleId => moduleIds.includes(moduleId.toString()));

    // Add the new modules to the role if they aren't already present
    role.modules = [...new Set([...role.modules.map(m => m.toString()), ...moduleIds])];

    // Save the updated role
    await role.save();

    res.status(200).json({ message: 'Modules added to the role successfully.', role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
router.post("/assign-role", async (req, res) => {
  const { userId, roleId, moduleIds } = req.body;
  try {
    const user = await User.findById(userId);
    if (roleId === "superadmin") {
      return res.status(403).json({ message: "Cannot assign the 'superadmin' role." });
    }
    let role = await Role.findOne({ name: roleId });
    if (!role) {
      role = await Role.create({ name: roleId });
    }
    
    const modules = await Module.find({ _id: { $in: moduleIds } });

    if (!user || !role) {
      return res.status(404).json({ message: "User or Role not found" });
    }

    user.role = role;
    user.modulesAccess = modules;
    await user.save();

    res.json({ message: "Role and modules assigned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" , error: error.message || error  });
  }
});

export default router;