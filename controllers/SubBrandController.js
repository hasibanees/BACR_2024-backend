import multer from "multer";
import SubBrand from "../models/SubBrand.js";

export const createBrand = async (req, res) => {
s
  const { name, usedProd,newProd,spPrt } = req.body;
  if (!name ) {
    return res.status(400).json({ message: "Name field is required" });
  }
  try {
    // Create new brand
    const brand = new SubBrand({ name, usedProd, newProd, spPrt });
    await brand.save();
    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    res.status(500).json({ message: "Error saving brand", error });
  }

};
export const getBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const brand = await SubBrand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ brand });
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
 brands = await SubBrand.find(query);
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
  const {  name, usedProd,newProd,spPrt } = req.body;

  try {
    const brand = await SubBrand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }    
    if(req.files['image']){
      brand.image = req.files['image'][0].path; // Normalize file path
    }
    if(req.files['coverimage']){
      brand.coverimage = req.files['coverimage'][0].path; // Normalize file path
    }
    // Update fields
    if (name) brand.name = name;
    if (newProd) brand.newProd = newProd;
    if (usedProd) brand.usedProd = usedProd;
    if (spPrt) brand.spPrt = spPrt;

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
    const brand = await SubBrand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error });
  }
};
