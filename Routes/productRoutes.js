import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getSrno,
  getThreeProducts,
  deleteProduct,
  getBrandProducts,
  downloadProductMessages
} from "../controllers/productController.js";

const router = express.Router();

router.post("/product", createProduct);           // Create a new product
router.get("/products", getAllProducts);          // Get all products
router.get("/threeproducts/:brandId", getThreeProducts);          // Get all products
router.get("/product-download/:filter", downloadProductMessages);          // Get all products
router.get("/product/getSrno/:filter", getSrno);         // Get all products
router.get("/product-filter/:filter", getBrandProducts);

// Route with both filter and id
router.get("/product-filter/:filter/:id", getBrandProducts);
router.get("/product/:id", getProductById);       // Get a single product by ID
router.put("/product/:id", updateProduct);        // Update a product by ID
router.delete("/product/:id", deleteProduct);     // Delete a product by ID

export default router;