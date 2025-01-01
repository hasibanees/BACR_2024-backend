import multer from "multer";
import Project from "../models/Project.js";
import ProjectImages from "../models/ProjectImages.js";
import path from "path";
import { ProjectStorage } from "../utils/fileUploder.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/projects"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
const storage =ProjectStorage;
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // 2MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|doc/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) are allowed"));
    }
  }
}).fields([
  { name: "images"}, 
  { name: "mainImage", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);

// Function to create a new project
export const createProject = async (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
  const { name, location, client, description, category,sr_no } = req.body;

  // Validate required fields
  if (!name || !location || !client || !description || !sr_no ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Shift existing sr_no if it conflicts with the provided sr_no
    const existingProjects = await Project.find({ sr_no: { $gte: sr_no } }).sort({ sr_no: -1 });
    for (const project of existingProjects) {
      await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
    }
    const updateData = {name,location,client,category,description,sr_no};
    if (sr_no) {
      const existingProjects = await Project.find({ sr_no: { $gte: sr_no } }).sort({ sr_no: -1 });
        if(existingProjects.length > 0){
          for (const project of existingProjects) {
      if (project.sr_no >= sr_no) {
        // If the project's sr_no is greater than or equal to the new project's sr_no, increment it
        await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
      } else if (project.sr_no < sr_no) {
        // If the project's sr_no is less than the new project's sr_no, decrement it
        await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no - 1 });
      }
    //     await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
      }
    }
    }
    const mainimage = req.files['mainImage'] ? req.files['mainImage'][0] : null;
    const logo = req.files['logo'] ? req.files['logo'][0] : null;
    if (mainimage) {
      updateData.mainimage = mainimage.path; // Save the path to the main image
    }
    if (logo) {
      updateData.logo = logo.path; // Save the path to the main image
    }
    const project = new Project(updateData);
    
    await project.save();
    const imageFiles = req.files['images'];

    if (imageFiles) {
      // Create Image documents for each uploaded image and store their references
      const imageDocuments = await Promise.all(
        imageFiles.map(async (imageFile) => {
          const newImage = new ProjectImages({
            path: imageFile.path,
            project: project._id
          });
          await newImage.save(); // Save the image
          return newImage._id; // Return the image's ObjectId
        })
      );

      // Store the image references in the project data
      updateData.images = imageDocuments;
    }


    // Create the new project
    
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error saving project", error });
  }
});
};

// Function to get all projects
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ sr_no: 1 });
    const projectssWithCorrectImagePath = projects.map(project => {
      const correctImagePath = project.mainimage ? project.mainimage.replace(/\\+/g, '/') : "uploads/thumbnail.jpeg";
      const correctImagePathb = project.logo ? project.logo.replace(/\\+/g, '/') : "uploads/thumbnail.jpeg";
      return {
        ...project.toObject(),
        mainimage: `${correctImagePath}`,
        logo: `${correctImagePathb}`
      };
    });
    res.status(200).json({ projects:projectssWithCorrectImagePath });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error });
  }
};

export const getSrno = async (req, res) => {
  try {
    const project =  await Project.find()
    .sort({ sr_no: -1 }) // Sort in descending order
    .limit(1)
    .select("sr_no"); // Sort by sno in ascending order
    res.status(200).json({project});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error });
  }
};


// Function to get a single project by ID
export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const correctImagePath = project.mainimage ? project.mainimage.replace(/\\+/g, '/') : `${process.env.url}/uploads/thumbnail.jpeg`;
    const logoPath = project.logo ? project.logo.replace(/\\+/g, '/') : `${process.env.url}/uploads/thumbnail.jpeg`;

    const updatedProject = {
      ...project._doc,
      mainimage: `${correctImagePath}`,
      logo: `${logoPath}`,
    };
    
     // Process the images array and update paths for each image
     const projectImages = await ProjectImages.find({ project: id }).select('path -_id');
    // Process the images and adjust their paths
    const imagesWithUrls = projectImages.map(image => {
      const correctImagePath = image.path.replace(/\\+/g, '/');
      return {
        ...image._doc,  // Extract all image properties
        path: `${correctImagePath}`,  // Replace the path with a full URL
      };
    });
    res.status(200).json({
      project: updatedProject,
      images: imagesWithUrls,  // Include the images in the response
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving project", error });
  }
};

// Function to update a project by ID
export const updateProject = async (req, res) => {
  const { id } = req.params;
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
  const { sr_no,name,location, client,category, description } = req.body;
  
  try {
    // Shift existing sr_no if a new sr_no is provided and causes a conflict
    const updateData = {};
    let existingProjects={}
        let existingProjectsb={}
        if (sr_no) {
          const project = await Project.findById(id);
          if(project.sr_no > sr_no){
            const sr_nob=sr_no-1;
            existingProjectsb = await Project.find({
              sr_no: { $lt: project.sr_no, $gt: sr_nob }
            }).sort({ sr_no: 1 }); 
          }else if (project.sr_no < sr_no){
            existingProjects = await Project.find({   sr_no: { $gt: project.sr_no, $lte: sr_no } 
            }).sort({ sr_no: 1 }); // Sort in ascending order of sr_no
          }
    
          if (existingProjects.length > 0) {
            for (const project of existingProjects) {
              
                await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no - 1 });
               
            }
            
            updateData.sr_no = sr_no; 
          }
            if (existingProjectsb.length > 0) {
              
              for (const project of existingProjectsb) {
                
                  await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
                 
              }
              
              updateData.sr_no = sr_no; 
            }
      }
    
    
    if(name) updateData.name=name;
    if(location) updateData.location=location;
    if(client) updateData.client=client;
    if(description) updateData.description=description;
    if(category) updateData.category=category;
    if (req.files && req.files['mainImage']) {
      const mainImage = req.files['mainImage'][0];
      updateData.mainimage = mainImage.path;
    }
    if (req.files && req.files['logo']) {
      const logo = req.files['logo'][0];
      updateData.logo = logo.path;
    }

    // Handle file uploads for additional images
    if (req.files && req.files['images']) {
      await ProjectImages.deleteMany({ project: id });

      const imageFiles = req.files['images'];
      const imageDocuments = await Promise.all(
        imageFiles.map(async (imageFile) => {
          const newImage = new ProjectImages({
            path: imageFile.path,
            project: id,
          });
          await newImage.save();
          return newImage._id; // Return the image's ObjectId
        })
      );

      // Add the new image references to the project
      const existingImages = await ProjectImages.find({ project: id }).select('_id');
      updateData.images = [...existingImages.map(img => img._id), ...imageDocuments];
    }

    // Update the project with the new data
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
});
};

// Function to delete a project by ID
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the project to delete
    const projectToDelete = await Project.findById(id);
    if (!projectToDelete) {
      return res.status(404).json({ message: "Project not found" });
    }

    const { sr_no } = projectToDelete;

    // Delete the project
    await Project.findByIdAndDelete(id);

    // Find all projects with a sr_no greater than the deleted project
    const projectsToUpdate = await Project.find({ sr_no: { $gt: sr_no } })
      .sort('sr_no') // Sort projects by sr_no in ascending order
      .exec();

    // Update the sr_no for each project
    for (let i = 0; i < projectsToUpdate.length; i++) {
      const project = projectsToUpdate[i];
      project.sr_no = project.sr_no - 1; // Decrease the sr_no by 1
      await project.save();
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};
