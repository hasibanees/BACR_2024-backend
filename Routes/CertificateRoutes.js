import express from "express";
import {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  getSrno
} from "../controllers/CertificateController.js";

const router = express.Router();

// Define routes
router.post("/certificates", createCertificate);
router.get("/certificates", getAllCertificates);
router.get("/getSrno", getSrno);
router.get("/certificate/:id", getCertificateById);
router.put("/certificate/:id", updateCertificate);
router.delete("/certificate/:id", deleteCertificate);

export default router;