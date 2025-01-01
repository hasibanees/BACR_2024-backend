import Team from "../models/Team.js";
import multer from "multer";
import path from "path";
import { TeamStorage } from "../utils/fileUploder.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/teams");  // Directory for storing uploaded images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
//   }
// });
const storage =TeamStorage;
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },  // 1MB limit
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
}).single("image");  // Expecting a single file upload with field name "image"


// Insert new team member
export const createTeamMember = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    const { name, designation, email,bio } = req.body;
    console.log(req.body);
    
    let image=req.file;
  if(req.file){
   image = req.file.path;
}
    const existingMember = await Team.findOne({ email });
    if (existingMember) {
      return res.status(404).json({ message: 'Email already exists' });
    }
  if (!name  || !email ) {
    return res.status(400).json({ message: 'Name and Email Field are Required' });
  }

  try {
  
    const teamMember = new Team({
      name,
      designation,
      bio,
      email,
      imagePath: image
    });

    await teamMember.save();
    res.status(201).json({ message: 'Team member created successfully', teamMember });
  } catch (error) {
    res.status(500).json({ message: 'Error saving team member', error });
  }
});
};

// Get all team members
export const getAllTeamMembers = async (req, res) => {
  try {
    const teams = await Team.find();
    const teamsWithCorrectImagePath = teams.map(team => {
      const imagePath = team.imagePath ? team.imagePath.replace(/\\+/g, '/') : null;
      return {
        ...team.toObject(),
        imagePath: imagePath ? `${imagePath}` : `${process.env.url}/uploads/thumbnail.jpeg`
      };
    });
    res.status(200).json({ teams:teamsWithCorrectImagePath });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving team members'+ error });
  }
};

// Get a single team member by ID
export const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    const correctImagePath = teamMember.imagePath.replace(/\\+/g, '/');
    const updatedTeam = {
      ...teamMember._doc, // Extract all Team properties
      imagePath: `${correctImagePath}`,
    };
    res.json({team:updatedTeam});
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving team member', error });
  }
};

// Update a team member by ID
export const updateTeamMember = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
  const { name, designation, email,bio } = req.body;
  const image = req.file;

  try {
    const teamMember = await Team.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    if (name) teamMember.name = name;
    if (designation) teamMember.designation = designation;
    if (email) teamMember.email = email;
    if (bio) teamMember.bio = bio;
    if (image) teamMember.imagePath = image.path;    

    await teamMember.save();
    res.json({ message: 'Team member updated successfully', teamMember });
  } catch (error) {
    console.error("Error updating team member:", error); // Log the error
    res.status(500).json({ message: 'Error updating team member', error });
  }
  });
};

// Delete a team member by ID
export const deleteTeamMember = async (req, res) => {
  try {
    const teamMember = await Team.findByIdAndDelete(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team member', error });
  }
};
