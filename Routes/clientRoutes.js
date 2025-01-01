import express from "express";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  getSrno,
  deleteClient,
  fetchClientSr
} from "../controllers/clientController.js";

const router = express.Router();

router.post("/client", createClient);           // Create a new client
router.get("/clients", getAllClients)
router.get("/clientsr/:sr_no", fetchClientSr);          // Get all clients
router.get("/client-getSrno", getSrno);          // Get all clients
router.get("/client/:id", getClientById);       // Get a single client by ID
router.put("/client/:id", updateClient);        // Update a client by ID
router.delete("/client/:id", deleteClient);     // Delete a client by ID

export default router;
