import multer from "multer";
import Brand from "../models/Brand.js";
import path from "path";
import { BrandStorage } from "../utils/fileUploder.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/brands"),
//   filename: (req, file, cb) => {
//     // Replace spaces with underscores and remove any double spaces
//     const cleanName = file.originalname
//       .replace(/\s+/g, "_") // Replace spaces with underscores
//       .replace(/[^a-zA-Z0-9._-]/g, ""); // Remove any special characters except allowed ones
//     cb(null, Date.now() + "-" + cleanName);
//   },
// });

const storage =BrandStorage;
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024,
    fieldSize: 20 * 1024 * 1024 },  // 2MB limit
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
}).fields([
  { name: "coverimage", maxCount: 1 }, // For the blog image
  { name: "image", maxCount: 1 }, // For the Excel file with emails
]);

export const createBrand = async (req, res) => {

// Function to create a brand
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
  const { name, usedProd,newProd,spPrt,website,category,details,authorize } = req.body;
  if (!name ) {
    return res.status(400).json({ message: "Name field is required"+name });
  }
    let imagePath="";
    let coverimagePath="";
    if (req.files && req.files['image'] && req.files['image'][0]) {
      imagePath = req.files['image'][0].path; // Ensure you're storing the file path
    }
    if (req.files && req.files['coverimage'] && req.files['coverimage'][0]) {
      coverimagePath = req.files['coverimage'][0].path; // Ensure you're storing the file path
    }
  try {
    // Create new brand
    const brand = new Brand({ name, usedProd,image:imagePath,coverimage:coverimagePath,website,details,category, newProd, spPrt,authorize });
    await brand.save();
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Error saving brand", error });
  }
  });
};

// Function to get all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    const brandsWithCorrectImagePath = brands.map(brand => {
      const correctImagePath = brand.coverimage ? brand.coverimage.replace(/\\+/g, '/'): "upload/thumbnail.jpeg";
      const correctImagePathb = brand.image ? brand.image.replace(/\\+/g, '/'): "upload/thumbnail.jpeg";
      return {
        ...brand.toObject(),
        coverimage: `${correctImagePath}`,
        image: `${correctImagePathb}`
      };
    });
    res.status(200).json({brands:brandsWithCorrectImagePath});
                    } catch (error) {
                      res.status(500).json({ message: "Error retrieving brands", error });
  }
};

export const getAllBrandsFront = async (req, res) => {
  try {
    const brands = await Brand.find({ category: { $ne: "subbrand" } });
    const brandsWithCorrectImagePath = brands.map(brand => {
      const correctImagePath = brand.coverimage ? brand.coverimage.replace(/\\+/g, '/'): `${process.env.url}/uploads/thumbnail.jpeg`;
      const correctImagePathb = brand.image ? brand.image.replace(/\\+/g, '/'): `${process.env.url}/uploads/thumbnail.jpeg`;
      return {
        ...brand.toObject(),
        coverimage: `${correctImagePath}`,
        image: `${correctImagePathb}`
      };
    });
    res.status(200).json({brands:brandsWithCorrectImagePath});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving brands", error });
  }
};

export const getBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const correctImagePath = brand.coverimage
      ? brand.coverimage.replace(/\\+/g, "/")
      :`${process.env.url}/uploads/thumbnail.jpeg`;
    const correctImagePathb = brand.image
      ? brand.image.replace(/\\+/g, "/")
      : null;
    const correctImagePathc = brand.logo
      ? brand.logo.replace(/\\+/g, "/")
      : `${process.env.url}/uploads/thumbnail.jpeg`;

    // Modify the brand object
    const updatedBrand = {
      ...brand.toObject(),
      coverimage: `${correctImagePath}`,
      image: `${correctImagePathb}`,
      logo: `${correctImagePathc}`,
    };

    res.status(200).json({ brand:updatedBrand });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving brand", error });
  }
};

export const getBrandByFilter = async (req, res) => {
  const { filter } = req.params;

  try {
    const query = {};
if (filter === "used") query.usedProd = 1;
if (filter === "new") query.newProd = 1;
if (filter === "spare") query.spPrt = 1;

let brands = [];

if(filter=== "used" ||  filter=== "new" ||filter=== "spare"){
 brands = await Brand.find(query);
}
if (!brands || brands.length === 0) {
  return res.status(404).json({ message: "No brands found" });
}

    res.status(200).json({ brands });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving brand", error });
  }
};


// Function to update a brand
export const updateBrand = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
  const {  name, usedProd,newProd,spPrt,website,details,category,authorize } = req.body;

  try {
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }    
    if(req.files['image']){
      const imagePath = req.files['image'][0].path.replace(/\s+/g, "_");
      brand.image = imagePath;

    }
    if(req.files['coverimage']){
      const coverImagePath = req.files['coverimage'][0].path.replace(/\s+/g, "_");
      brand.coverimage = coverImagePath;
    }
    // Update fields
    if (name) brand.name = name;
    if (details) brand.details = details;
    if (website) brand.website = website;
    if (category) brand.category = category;
    
    if (newProd) brand.newProd = newProd;
    if (usedProd) brand.usedProd = usedProd;
    if (spPrt) brand.spPrt = spPrt;
    if (authorize) brand.authorize = authorize;

    await brand.save();
    res.status(200).json({ message: "Brand updated successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Error updating brand", error });
  }
});
};

// Function to delete a brand
export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error });
  }
};
