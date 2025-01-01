import Certificate from "../models/Certificate.js";
import multer from "multer";
import path from "path";
import { CertificateStorage } from "../utils/fileUploder.js";
// Configure multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/certificates"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
const storage = CertificateStorage;
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // 2MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) are allowed"));
    }
  }
}).single("image");

// Function to create a certificate
export const createCertificate = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          // File size exceeded: send 500 error
          return res.status(500).json({ message: "File size exceeds 2MB limit" });
        }
        return res.status(400).json({ message: "Error uploading image", error: err });
      }
      const { sr_no,name,issuedDate,issuedBy } = req.body;
      if (sr_no) {
        const existingCertificates = await Certificate.find({ sr_no: { $gte: sr_no } }).sort({ sr_no: -1 });
        if(existingCertificates.length > 0){
          for (const certificate of existingCertificates) {
      if (certificate.sr_no >= sr_no) {
        await Certificate.findByIdAndUpdate(certificate._id, { sr_no: certificate.sr_no + 1 });
      } else if (certificate.sr_no < sr_no) {
        // If the certificate's sr_no is less than the new certificate's sr_no, decrement it
        await Certificate.findByIdAndUpdate(certificate._id, { sr_no: certificate.sr_no - 1 });
      }
  
      }
      }
    }
      const image = req.file;
  
      // Check if the required fields are provided
      if (!sr_no || !image) {
        return res.status(400).json({ message: "sr_no and image are required" });
      }
  
      try {
        // First, find all certificates with sr_no greater than or equal to the new sr_no
        const existingCertificates = await Certificate.find({ sr_no: { $gte: sr_no } })
          .sort({ sr_no: -1 }); // Sort in descending order
  
        // If there are existing certificates, increment their sr_no
        if (existingCertificates.length > 0) {
          // Loop through existing certificates and update their sr_no
          for (let certificate of existingCertificates) {
            certificate.sr_no += 1; // Increment sr_no
            await certificate.save(); // Save the updated certificate
          }
        }
  
        // Create new certificate with the provided sr_no
        const certificate = new Certificate({
          sr_no: sr_no,
          issuedDate:issuedDate,
          issuedBy:issuedBy,
          imagePath: image.path,
          name:name
        });
  
        await certificate.save();
        res.status(201).json({ message: "Certificate created successfully", certificate });
      } catch (error) {
        res.status(500).json({ message: "Error saving certificate", error });
      }
    });
  };

// Function to get all certificates
export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ sr_no: 1 }); // Sort by sno in ascending order
    const certificatesWithCorrectImagePath = certificates.map(certificate => {
      const correctImagePath = certificate.imagePath.replace(/\\+/g, '/');
      return {
        ...certificate.toObject(),
        imagePath: `${correctImagePath}`
      };
    });
    res.status(200).json({certificates:certificatesWithCorrectImagePath});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving certificates", error });
  }
};

export const getSrno = async (req, res) => {
  try {
    const certificate =  await Certificate.find()
    .sort({ sr_no: -1 }) // Sort in descending order
    .limit(1)
    .select("sr_no"); // Sort by sno in ascending order
    res.status(200).json({certificate:certificate});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving certificates", error });
  }
};

// Function to get a certificate by ID
export const getCertificateById = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    const correctImagePath = certificate.imagePath.replace(/\\+/g, '/');
    const updatedCertificate = {
      ...certificate._doc, // Extract all certificate properties
      imagePath: `${correctImagePath}`,
    };
    res.status(200).json({updatedCertificate});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving certificate", error });
  }
};
// Function to update a certificate
export const updateCertificate = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        // File size exceeded: send 500 error
        return res.status(500).json({ message: "File size exceeds 2MB limit" });
      }
      return res.status(400).json({ message: "Error uploading image", error: err });
    }
  const { sr_no,name,issuedBy,issuedDate } = req.body; // New serial number
  
  const image = req.file;
  try {
    const updateData = {};

    // Check if the new sr_no already exists for another certificate
      let existingCertificates={}
         let existingCertificatesb={}
         if (sr_no) {
           const certificate = await Certificate.findById(id);
           if(certificate.sr_no > sr_no){
             console.log("te1"+sr_no);
             const sr_nob=sr_no-1;
             existingCertificatesb = await Certificate.find({
               sr_no: { $lt: certificate.sr_no, $gt: sr_nob }
             }).sort({ sr_no: 1 }); 
           }else if (certificate.sr_no < sr_no){
             existingCertificates = await Certificate.find({   sr_no: { $gt: certificate.sr_no, $lte: sr_no } 
             }).sort({ sr_no: 1 }); // Sort in ascending order of sr_no
           }
     
           if (existingCertificates.length > 0) {
             for (const certificate of existingCertificates) {
               
                 await Certificate.findByIdAndUpdate(certificate._id, { sr_no: certificate.sr_no - 1 });
                
             }
             
             updateData.sr_no = sr_no; 
           }
             if (existingCertificatesb.length > 0) {
               
               for (const certificate of existingCertificatesb) {
                 
                   await Certificate.findByIdAndUpdate(certificate._id, { sr_no: certificate.sr_no + 1 });
                  
               }
               
               updateData.sr_no = sr_no; 
             }
       }
    // Prepare update data
    if (sr_no) updateData.sr_no = sr_no;
    updateData.name = name;
    updateData.issuedDate = issuedDate;
    updateData.issuedBy = issuedBy;
    if (image) updateData.imagePath = image.path;

    // Update the certificate
    const updatedCertificate = await Certificate.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json({ message: "Certificate updated successfully", updatedCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error updating certificate"+ error.message });
  }
});
};

// Function to delete a certificate
export const deleteCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCertificate = await Certificate.findByIdAndDelete(id);
    if (!deletedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting certificate", error });
  }
};

