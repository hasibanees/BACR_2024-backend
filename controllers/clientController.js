import Client from "../models/Client.js";
import multer from "multer";
import path from "path";
import { AssetStorage } from "../utils/fileUploder.js";

// Configure multer for file uploads with a 1MB size limit
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/clients");  // Directory for storing uploaded images
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
//   }
// });
const storage = AssetStorage;

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

// Create a new client
export const createClient = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err + process.env.CLOUDNAME});
    }

    const { name,sr_no } = req.body;
    if (sr_no) {
      const existingClient = await Client.find({ sr_no: { $gte: sr_no } }).sort({ sr_no: -1 });
        if(existingClient.length > 0){
          for (const client of existingClient) {
      if (client.sr_no >= sr_no) {
        // If the project's sr_no is greater than or equal to the new project's sr_no, increment it
        await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no + 1 });
      } else if (client.sr_no < sr_no) {
        // If the project's sr_no is less than the new project's sr_no, decrement it
        await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no - 1 });
      }
    //     await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
      }
    }
    }
    let image;
    // if(req.file){
    image =  req.file?.path || "";;
    // }
    if (!name,!sr_no) {
      return res.status(400).json({ message: "Name,Sr No and image are required" });
    }
    const existingClient = await Client.findOne({ name,sr_no });
    if (existingClient) {
      return res.status(404).json({ message: 'Name already exists' });
    }
    try {
      const client = new Client({
        name,
        sr_no,
        imagePath: image
      });

      await client.save();
      res.status(201).json({ message: "Client created successfully", client });
    } catch (error) {
      res.status(500).json({ message: "Error saving client", error });
    }
  });
};

// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ sr_no: 1 });
    const clientsWithCorrectImagePath = clients.map(client => {
      const correctImagePath = client.imagePath ? client.imagePath.replace(/\\+/g, '/'): null;
      return {
        ...client.toObject(),
        imagePath: `${correctImagePath}`
      };
    });
    res.status(200).json({ clients: clientsWithCorrectImagePath });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients", error });
  }
};

// Get a single client by ID
export const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ client });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client", error });
  }
};
export const getSrno = async (req, res) => {
  try {
    const client =  await Client.find()
    .sort({ sr_no: -1 }) // Sort in descending order
    .limit(1)
    .select("sr_no"); // Sort by sno in ascending order
    res.status(200).json({client});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving clients", error });
  }
};

// Update client information by ID
export const fetchClientSr = async (req, res) => {
  const { sr_no } = req.params;
  const updateData = {};

  if (sr_no) {
    const existingClient = await Client.find({ sr_no: { $lt: sr_no } }).sort({ sr_no: -1 });
      if(existingClient.length > 0){
        for (const client of existingClient) {
    if (client.sr_no >= sr_no) {
      // If the project's sr_no is greater than or equal to the new project's sr_no, increment it
      await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no + 1 });
    } else if (client.sr_no < sr_no) {
      // If the project's sr_no is less than the new project's sr_no, decrement it
      await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no - 1 });
    }
  //     await Project.findByIdAndUpdate(project._id, { sr_no: project.sr_no + 1 });
    }
    updateData.sr_no = sr_no;
  }
  }
  return res.status(404).json({ message: updateData });
}

export const updateClient = async (req, res) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    const { name,sr_no } = req.body;
    const image = req.file;

    const updateData = {};
    let existingClients={}
    let existingClientsb={}
    if (sr_no) {
      const client = await Client.findById(id);
      if(client.sr_no > sr_no){
        console.log("te1"+sr_no);
        const sr_nob=sr_no-1;
        existingClientsb = await Client.find({
          sr_no: { $lt: client.sr_no, $gt: sr_nob }
        }).sort({ sr_no: 1 }); 
      }else if (client.sr_no < sr_no){
        existingClients = await Client.find({   sr_no: { $gt: client.sr_no, $lte: sr_no } 
        }).sort({ sr_no: 1 }); // Sort in ascending order of sr_no
      }

      if (existingClients.length > 0) {
        for (const client of existingClients) {
          
            await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no - 1 });
           
        }
        
        updateData.sr_no = sr_no; 
      }
        if (existingClientsb.length > 0) {
          
          for (const client of existingClientsb) {
            
              await Client.findByIdAndUpdate(client._id, { sr_no: client.sr_no + 1 });
             
          }
          
          updateData.sr_no = sr_no; 
        }
  }

  
    if (name) updateData.name = name;
    if (image) updateData.imagePath = image.path;

    try {
      const updatedClient = await Client.findByIdAndUpdate(id,updateData, { new: true });
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(200).json({ message: "Client updated successfully", updatedClient });
    } catch (error) {
      res.status(500).json({ message: "Error updating client", error });
    }
  });
};

// Delete a client by ID
export const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedClient = await Client.findByIdAndDelete(id);
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error });
  }
};
