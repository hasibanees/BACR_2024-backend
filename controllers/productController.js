import Product from "../models/Product.js";
import Category from "../models/Category.js";
import PDFDocument from "pdfkit";
import { __dirname } from '../server.js';
import Brand from "../models/Brand.js";
import ProductImages from "../models/ProductImages.js";
import multer from "multer";
import path from "path";
import {mixpanel} from "../server.js";
import fs from "fs";
import mongoose from "mongoose";
import { ProductStorage } from "../utils/fileUploder.js";

// Configure multer for file uploads with a 1MB size limit
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/products");  // Directory for storing uploaded images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
//   }
// });
const storage =ProductStorage;

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024,
    fieldSize: 20 * 1024 * 1024 },  // 1MB limit
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
  { name: "images" }, // For the blog image
  { name: "image", maxCount: 1 }, // For the Excel file with emails
  { name: "logo", maxCount: 1 }, // For the Excel file with emails
]);

// Create a new product
export const createProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    const { name, sr_no,sr_nop,part, model,categoryId,brandId,filter, price, aval, detail,capacity,quantity } = req.body;

    let imagePath;
    let imagePathLogo;
    if (!name ||!sr_no|| !sr_nop || !categoryId) {
      return res.status(400).json({ message: "Name,SR No, Serial No and categoryId of product fields are required" });
    }
    const validAvalValues = ["instock", "outofstock", "inorder"];
    if (!validAvalValues.includes(aval)) {
      return res.status(400).json({ message: "Invalid value for 'aval'. Allowed values are 'instock', 'outofstock', 'inorder'." });
    }
    try {
      
      const isCategoryIdValid = mongoose.Types.ObjectId.isValid(categoryId);
      let finalCategoryId = categoryId; // Default to provided categoryId
      const mainimage = req.files['image'] ? req.files['image'][0] : null;
      const logo = req.files['logo'] ? req.files['logo'][0] : null;
      if (logo) {
        imagePathLogo = logo.path; // Save the path to the main image
      }
      if (mainimage) {
        imagePath = mainimage.path; // Save the path to the main image
      }
      // If categoryId is not valid, treat it as a new category name
      if (!isCategoryIdValid) {
        const newCategory = new Category({ name: categoryId }); // Assuming `Category` schema has a `name` field
        const savedCategory = await newCategory.save();
        finalCategoryId = savedCategory._id; // Use the new category ID
      }

      const existingProducts = await Product.find({ sr_no: { $gte: sr_no },proType: filter, }).sort({ sr_no: -1 }); 
      // console.log(existingProducts);
      
    // If there are existing certificates, increment their sr_no
    if (existingProducts.length > 0) {
      // Loop through existing certificates and update their sr_no
      for (let product of existingProducts) {
        // product.sr_no += 1; // Increment sr_no
        // await product.save();
        await Product.findByIdAndUpdate(product._id, { sr_no: product.sr_no + 1 });
      }
    }

      const product = new Product({
        name,
        sr_no,
        sr_nop,
        logo:imagePathLogo,
        part,
        capacity,
        model,
        brandId,
        quantity,
        categoryId: finalCategoryId,
        proType: filter,
        price,
        aval,
        detail,
        imagePath
      });

      await product.save();
      const imageFiles = req.files['images'];

      if (imageFiles) {
        // Create Image documents for each uploaded image and store their references
        const imageDocuments = await Promise.all(
          imageFiles.map(async (imageFile) => {
            const newImage = new ProductImages({
              path: imageFile.path,
              product: product._id
            });
            await newImage.save(); // Save the image
            return newImage._id; // Return the image's ObjectId
          })
        );
      }
  

      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      res.status(500).json({ message: "Error saving product", error: error.message || error });

    }
  });
};

export const getAllProducts = async (req, res) => {
  try {
    
    const { page = 1, limit = 10 } = req.query; // Default values for page and limit

    const products = await Product.find()
      .sort({ sr_no: 1 })
      .populate("brandId", "newProd usedProd spPrt name") // Populate the brandId field
      .populate("categoryId", "name") // Populate the brandId field
      .skip((page - 1) * limit) // Calculate the number of documents to skip
      .limit(parseInt(limit)) // Limit the number of documents returned
      .exec();    
      const productsWithCorrectImagePath = await Promise.all(products.map(async (product) => {
      let correctImagePath = null;      
      if (product.imagePath) {
        correctImagePath = product.imagePath.replace(/\\+/g, '/');
      }

  // Handle cases where brandId might be null or undefined
  const brandFlags = product.brandId
    ? {
        newProd: product.brandId.newProd === 1,
        usedProd: product.brandId.usedProd === 1,
        spare: product.brandId.spPrt === 1,
      }
    : {
        newProd: false,
        usedProd: false,
        spare: false,
      };
      let isValidProduct = false;
      if (product.proType === 'new' && brandFlags.newProd) {
        isValidProduct = true;
      } else if (product.proType === 'used' && brandFlags.usedProd) {
        isValidProduct = true;
      } else if (product.proType === 'spare' && brandFlags.spare) {
        isValidProduct = true;
      }
      if (!isValidProduct) {
        return null; // If the product doesn't match the proType and brand flag, return null
      }
      const productImages = await ProductImages.find({ product: product._id });

      return {
        ...product.toObject(),
        imagePath: correctImagePath
          ? `${correctImagePath}`
          : `${process.env.url}/uploads/thumbnail.jpeg`, // Default placeholder
        brandFlags, // Add the brand flags (newProd, usedProd, spare) to the product
        images: productImages.map((img) => `${img.path.replace(/\\+/g, '/')}`),

      };
    }));
    const filteredProducts = productsWithCorrectImagePath.filter(product => product !== null);


const totalProducts = await Product.countDocuments(); // Count the total number of products
const totalPages = Math.ceil(totalProducts / limit); 
const brands = await Brand.find({
  $or: [
    { newProd: 1 },
    { usedProd: 1 },
    { spPrt: 1 },
  ],
}).select('_id newProd usedProd spPrt');

    res.status(200).json({ products: filteredProducts,brands:brands, currentPage: parseInt(page),
      totalPages: totalPages,
      totalProducts: totalProducts });
  } catch (error) {
    // res.status(500).json({ message: "Error retrieving products", error });
    res.status(500).json({ message: "Error retrieving product", error: error.message || error });
  }
};

export const getThreeProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Add brandId filter to the query
    const { brandId } = req.params; // Add brandId filter to the query

    if (!brandId) {
      return res.status(400).json({ message: "Brand ID is required" });
    }

    // Fetch products for the specific brandId and limit the result to 3 products
    const products = await Product.find({ brandId })
      .limit(3) // Limit to the first 3 products
      .populate("brandId", "newProd usedProd spare") // Populate the brandId field
      .exec();

    const productsWithCorrectImagePath = await Promise.all(
      products.map(async (product) => {
        let correctImagePath = null;
        let correctlogo = null;
        if (product.imagePath) {
          correctImagePath = product.imagePath.replace(/\\+/g, '/');
        }
        if (product.logo) {
          correctlogo = product.logo.replace(/\\+/g, '/');
        }

        // Handle cases where brandId might be null or undefined
        const brandFlags = product.brandId
    ? {
        newProd: product.brandId.newProd === 1,
        usedProd: product.brandId.usedProd === 1,
        spare: product.brandId.spPrt === 1,
      }
    : {
        newProd: false,
        usedProd: false,
        spare: false,
      };
      let isValidProduct = false;
      if (product.proType === 'new' && brandFlags.newProd) {
        isValidProduct = true;
      } else if (product.proType === 'used' && brandFlags.usedProd) {
        isValidProduct = true;
      } else if (product.proType === 'spare' && brandFlags.spare) {
        isValidProduct = true;
      }
      if (!isValidProduct) {
        return null; // If the product doesn't match the proType and brand flag, return null
      }

        const productImages = await ProductImages.find({ product: product._id });

        return {
          ...product.toObject(),
          imagePath: correctImagePath
            ? `${correctImagePath}`
            : `${process.env.url}/uploads/thumbnail.jpeg`, // Default placeholder
          logo: correctlogo
            ? `${correctlogo}`
            : `${process.env.url}/uploads/thumbnail.jpeg`, // Default placeholder
        };
      })
    );

    const filteredProducts = productsWithCorrectImagePath.filter((product) => product !== null);

    res.status(200).json({ products: filteredProducts });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error: error.message || error });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const today = new Date();
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const product = await Product.findOne({
      _id: id,
      createdAt: { $gte: sixtyDaysAgo }, // Ensures the product was created in the last 60 days
    }).populate("brandId","name image");


if (!product) {
  return res.status(404).json({ message: "Product not found" });
}

// Process imagePath only after confirming the product is found
const correctImagePath = product.imagePath ? product.imagePath.replace(/\\+/g, '/') : null;
const correctLogoPath = product.brandId.image ? product.brandId.image.replace(/\\+/g, '/') : null;

const updatedProduct = {
  ...product._doc, // Extract all product properties
  imagePath: correctImagePath ? `${correctImagePath}` : `${process.env.url}/uploads/thumbnail.jpeg`, // Default image if no imagePath
  logo: correctLogoPath ? `${correctLogoPath}` : `${process.env.url}/uploads/thumbnail.jpeg`, // Default image if no imagePath
};

const productImages = await ProductImages.find({ product: id }).select('path -_id');

// Process the images and adjust their paths
const imagesWithUrls = productImages.map(image => {
  const correctImagePath = image.path ? image.path.replace(/\\+/g, '/') : null;
  return {
    ...image._doc,  // Extract all image properties
    path: correctImagePath ? `${correctImagePath}` : `${process.env.url}/uploads/thumbnail.jpeg`, // Default image if no path
  };
});

mixpanel.track('Product Viewed', {
  distinct_id: req.ip,
  productId: id,
});
    
    res.status(200).json({ product:updatedProduct,images: imagesWithUrls });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product", error: error.message || error  });
  }
};

export const getSrno = async (req, res) => {
  try {
    const { filter } = req.params;
    // const product =  await Product.find()
    // .sort({ sr_no: -1 }) // Sort in descending order
    // .limit(1)
    // .select("sr_no"); // Sort by sno in ascending order
    // res.status(200).json({product});
    const product = await Product.findOne({ proType: filter })
    .sort({ sr_no: -1 })
    .select("sr_no");
    if (!product) {
      // If no product is found and filter is new, used, or spare, set sr_no to 1
      if (["new", "used", "spare"].includes(filter)) {
        return res.status(200).json({product:{ sr_no: 0 }});
      } else {
        return res.status(404).json({ message: "No product found with the specified filter" });
      }
    }  

  res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving products", error });
  }
};
// Get a single product by ID
export const getBrandProducts = async (req, res) => {
  const { filter, id } = req.params;

try {
  let query = {};

  // Add filter conditions for the brand based on the filter
  if (filter === "used") query.usedProd = 1;
  if (filter === "new") query.newProd = 1;
  if (filter === "spare") query.spPrt = 1;

  if (id) {
    // Check if the id is a valid ObjectId string
    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id =new mongoose.Types.ObjectId(id); // Convert the string id to ObjectId
    } else {
      return res.status(400).json({ success: false, message: "Invalid brand ID" });
    }
  }

  // If no valid filter is provided, fetch all brands, and if a brand ID is present, match it
  if (!["used", "new", "spare"].includes(filter)) {
    query = id ? { _id: mongoose.Types.ObjectId(id) } : {}; // Only match the brand ID if provided
  }


    // Fetch matching brands based on the filter
    const matchingBrands = await Brand.find(query).select("_id");
    
    if (!matchingBrands) {
      return res.status(404).json({ message: "Brand not found" });
    }
    const matchingBrandIds = matchingBrands.map((brand) => brand._id);
    
    // Fetch products whose `brandId` matches the filtered brands
    const products = await Product.find({ brandId: { $in: matchingBrandIds } }).sort({ sr_no: 1 });
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Correct the image paths and include a placeholder if no image exists
    const productsWithCorrectImagePath = products.map((product) => {
      let correctImagePath = null;
      if (product.imagePath) {
        correctImagePath = product.imagePath.replace(/\\+/g, '/');
      }
      if (product.logo) {
      correctLogoPath = product.logo.replace(/\\+/g, '/');
      }
      return {
        ...product.toObject(),
        imagePath: correctImagePath
          ? `${correctImagePath}`
          : `${process.env.url}/uploads/thumbnail.jpeg`, // Default placeholder
          logo: correctLogoPath ? `${correctLogoPath}` : `${process.env.url}/uploads/thumbnail.jpeg`, // Default image if no imagePath
      };
    });

    res.status(200).json({ products: productsWithCorrectImagePath,brands:matchingBrands });

  } catch (error) {
    console.error("Error filtering products by brand:", error);
  }
};


// Update product information by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
    const { name,filter,capacity, sr_no,categoryId, model, price, part,aval, detail,quantity } = req.body;
    let imagePath,imagePathlogo;
    const mainimage = req.files['image'] ? req.files['image'][0] : null;
    const logo = req.files['logo'] ? req.files['logo'][0] : null;
    if (mainimage) {
      imagePath = mainimage.path; // Save the path to the main image
    }
    if (logo) {
      imagePathlogo = logo.path; // Save the path to the main image
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (sr_no) updateData.sr_no = sr_no;
    if (model) updateData.model = model;
    if (part) updateData.part = part;
    if (price) updateData.price = price;
    if (capacity) updateData.capacity = capacity;
    if (logo) updateData.logo = imagePathlogo;
    if (quantity) updateData.quantity = quantity;
    if (aval) updateData.aval = aval;
    if (detail) updateData.detail = detail;
    if (mainimage) updateData.imagePath = imagePath;
    if (categoryId) updateData.categoryId = categoryId;

    try {
      if (sr_no) {
        let existingProducts={}
        let existingProductsb={}
        if (sr_no) {
          const product = await Product.findById(id);
          if(product.sr_no > sr_no){
            const sr_nob=sr_no-1;
            existingProductsb = await Product.find({
              sr_no: { $lt: product.sr_no, $gt: sr_nob },proType: filter
            }).sort({ sr_no: 1 }); 
          }else if (product.sr_no < sr_no){
            existingProducts = await Product.find({   sr_no: { $gt: product.sr_no, $lte: sr_no } 
            ,proType: filter}).sort({ sr_no: 1 }); // Sort in ascending order of sr_no
          }
    
          if (existingProducts.length > 0) {
            for (const product of existingProducts) {
              
                await Product.findByIdAndUpdate(product._id, { sr_no: product.sr_no - 1 ,proType: filter});
               
            }
            
            updateData.sr_no = sr_no; 
          }
            if (existingProductsb.length > 0) {
              
              for (const product of existingProductsb) {
                
                  await Product.findByIdAndUpdate(product._id, { sr_no: product.sr_no + 1 ,proType: filter});
                 
              }
              
              updateData.sr_no = sr_no; 
            }
      }
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      const imageFiles = req.files['images'];
      let imageDocuments;
      if (imageFiles) {
        // Create Image documents for each uploaded image and store their references
        await ProductImages.deleteMany({ product:id });
         imageDocuments = await Promise.all(
          imageFiles.map(async (imageFile) => {
            const newImage = new ProductImages({
              path: imageFile.path,
              product: id
            });
            await newImage.save(); // Save the image
            return newImage._id; // Return the image's ObjectId
          })
        );
      }
      res.status(200).json({ message: "Product updated successfully", imageDocuments });
    } catch (error) {
      res.status(500).json({ message: "Error updating product", error: error.message || error });
    }
  });
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product to delete
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get the proType of the product to delete
    const { proType } = productToDelete;

    // Delete the product
    await Product.findByIdAndDelete(id);

    // Find products of the same proType that come after the deleted product
    const productsToUpdate = await Product.find({ proType })
      .where('sr_no').gt(productToDelete.sr_no) // Get products with a higher sr_no
      .sort('sr_no') // Sort by sr_no in ascending order
      .exec();

    // Update the sr_no of the subsequent products
    for (let i = 0; i < productsToUpdate.length; i++) {
      const product = productsToUpdate[i];
      product.sr_no = product.sr_no - 1; // Decrease sr_no by 1
      await product.save();
    }

    res.status(200).json({ message: "Product deleted and serial numbers updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

export const downloadProductMessages = async (req, res) => {
  try {
    const { filter } = req.params;
    const products = await Product.find({proType:filter});

    // Create a new PDF document
    const doc = new PDFDocument();

    // File path for saving the temporary PDF
    const filePath = path.join(__dirname, "Products.pdf");
    const writeStream = fs.createWriteStream(filePath);

    // Pipe the PDF content to the file
    doc.pipe(writeStream);

    // Add content to the PDF
    doc.fontSize(18).text("Product Messages", { align: "center" });
    doc.moveDown();

    const columnPositions = {
      srNo: 50,
      name: 100,
      availability: 300,
      quantity: 450,
    };
    const columnWidths = {
      srNo: 50,
      name: 200,
      availability: 150,
      quantity: 100,
    };
  
    // Table settings
    const tableStartY = doc.y;
    const rowHeight = 40; // Adjust row height to handle wrapped text
    const tableWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
    const lineWidth = 1;
  
    // Draw header row background
    doc.rect(columnPositions.srNo - lineWidth, tableStartY, tableWidth, rowHeight)
      .fill("#f0f0f0")
      .stroke();
  
    // Header content
    doc.fontSize(12)
      .fill("black")
      .text("SrNo", columnPositions.srNo, tableStartY + 10, { width: columnWidths.srNo, align: "center" })
      .text("Name", columnPositions.name, tableStartY + 10, { width: columnWidths.name, align: "center" })
      .text("Availability", columnPositions.availability, tableStartY + 10, { width: columnWidths.availability, align: "center" })
      .text("Quantity", columnPositions.quantity, tableStartY + 10, { width: columnWidths.quantity, align: "center" });
  
    doc.moveDown();
  
    // Table content
    let currentY = tableStartY + rowHeight;
    products.forEach((product, index) => {
      // Draw row borders
      doc.rect(columnPositions.srNo - lineWidth, currentY, tableWidth, rowHeight)
        .stroke();
  
      // Add text for each column
      doc.fontSize(12)
        .text(index + 1, columnPositions.srNo, currentY + 10, { width: columnWidths.srNo, align: "center" })
        .text(product.name, columnPositions.name, currentY + 10, { width: columnWidths.name, align: "left" })
        .text(product.aval, columnPositions.availability, currentY + 10, { width: columnWidths.availability, align: "center" })
        .text(product.quantity, columnPositions.quantity, currentY + 10, { width: columnWidths.quantity, align: "center" });
  
      // Move to the next row
      currentY += rowHeight;
    });
  

  doc.end();

    writeStream.on("finish", () => {
      // Send the file as a response for download
      res.download(filePath, "Products.pdf", err => {
        if (err) {
          res.status(500).json({ message: "Error downloading file", error: err });
        }

        // Delete the file after download
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF file "+ error.message });
  }
};