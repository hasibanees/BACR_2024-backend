import express from "express";
import {
  addCareer,
  getCareers
} from "../controllers/CareerController.js";

const router = express.Router();

// router.post("/add-career", addCareer);           // Create a new blog
router.get("/careers", getCareers);

export default router;