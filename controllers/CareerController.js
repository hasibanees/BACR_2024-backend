import multer from 'multer';
import Career from '../models/Career.js';
import Department from '../models/Department.js';
import nodemailer from "nodemailer";
import path from 'path';
import { CareerStorage } from '../utils/fileUploder.js';

const storage = CareerStorage;
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
}).single("resume");


export const addCareer = async (req, res) => {
    upload(req, res, async (err) => {
      const { name, phone, email, department} = req.body;
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: "File upload error: " + err.message });
        } else if (err) {
          return res.status(400).json({ message: "Error: " + err.message });
        }
    
      // Validate required fields
      if (!name ) {
        return res.status(400).json({ message: "Name is required!" });
      }
    
      try {

        const updateData = {name, phone, email, department};
        const resume = req.file;
        if (resume.path) {
          updateData.resume = resume.path;
        }
        const career = new Career(updateData);
        
        await career.save();
        const departmentRecord = await Department.findById(department);
        if (!departmentRecord) {
          return res.status(404).json({ message: "Department not found" });
        }
    
        const departmentEmail = departmentRecord.email;

        const transporter = nodemailer.createTransport({
          host: 'sandbox.smtp.mailtrap.io',
          port: 587,
          secure: false,
          auth: {
            user: 'bc706f92abe244',
            pass: 'daf333647f2f6a',
          }
        });
    
        // Define email options
        const mailOptions = {
          from: 'info@bacr.com.pk', // Sender address
          to: departmentEmail, // Recipient (department email)
          subject: `New Job Application: ${name}`, // Email subject
          text: `A new job application has been submitted.\n\n
          Name: ${name}\n
          Phone: ${phone}\n
          Email: ${email}\n
          Department: ${departmentRecord.name}`,
          attachments: [
            {
              filename: resume?.originalname || 'resume', // Use original filename or a default name
              path: resume?.path, // Path to the uploaded file
            },
          ],
        };
        // Email to the User
        const userMailOptions = {
          from: departmentEmail, // Sender address
          to: email, // User's email
          subject: 'Your Job Application Submission', // Email subject
          text: `Dear ${name},\n\nThank you for applying to the ${departmentRecord.name} department.\nWe have received your application and will be in touch shortly.\n\nBest regards,\nTeam`,
        };
    
        // Send the email
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(userMailOptions);
        res.status(201).json({ message: "Career created successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error saving career "+error.message });
      }
  });
  };
  
  export const updCareer = async (req, res) => {
    upload(req, res, async (err) => {
    
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: "File upload error: " + err.message });
        } else if (err) {
          return res.status(400).json({ message: "Error: " + err.message });
        }
    
      // Validate required fields
      if (!name ) {
        return res.status(400).json({ message: "Name is required!" });
      }
    
      try {
      const { name, phone, email, department} = req.body;

        const updateData = {name, phone, email, department};
        const resume = req.files['resume'] ? req.files['resume'][0] : null;
        if (resume.path) {
          updateData.resume = resume.path; // Save the path to the main image
        }
        const updatedProduct = await Product.Career(id, updateData, { new: true });
        await career.save();
        res.status(201).json({ message: "Career created successfully", project });
      } catch (error) {
        res.status(500).json({ message: "Error saving project", error });
      }
  });
  };

export const getCareers = async (req, res) => {
    try {
      const careers = await Career.find().populate('department', '_id name');
      const careersWithCorrectImagePath = careers.map(career => {
        const correctImagePath = career.resume.replace(/\\+/g, '/');
        return {
          ...career.toObject(),
          resume: `${correctImagePath}`
        };
      });
      res.status(200).json({careers:careersWithCorrectImagePath});
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving Careers', error });
    }
  };

  export const deleteCareer = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedCareer = await Career.findByIdAndDelete(id);
      if (!deletedCareer) {
        return res.status(404).json({ message: 'Career message not found' });
      }
      res.status(200).json({ message: 'Career message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting career message', error });
    }
  };