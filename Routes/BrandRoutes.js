import express from "express";
import {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
  getBrandById,
  getBrandByFilter,
  getAllBrandsFront
} from "../controllers/BrandController.js";

const router = express.Router();

router.post("/brand", createBrand);
router.get("/brands", getAllBrands);
router.get("/allbrands", getAllBrandsFront);
router.get("/brand-filter/:filter", getBrandByFilter);
router.get("/brand/:id", getBrandById);

// Route for updating a brand by ID
router.put("/brand/:id", updateBrand);

// Route for deleting a brand by ID
router.delete("/brand/:id", deleteBrand);

export default router;
