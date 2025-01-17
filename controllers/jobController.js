import Job from "../models/Job.js";
import multer from "multer";
import nodemailer from "nodemailer";
import JobApp from '../models/JobApp.js';
import path from "path";
import Department from "../models/Department.js";
import { JobStorage } from "../utils/fileUploder.js";

const storage = JobStorage;
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/jobs"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 ,
    fieldSize: 20 * 1024 * 1024},  // 1MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /doc|pdf/;
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
        updateData.category = "career";

        const career = new JobApp(updateData);
        
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


export const createJob = async (req, res) => {
  const { title, location,skills, desc,responsb,type,department,deadline,designation,requir,status,email } = req.body;
  
  
  if (title =="") {
    return res.status(400).json({ message: 'Title is required' });
  }
  let SkillsString = "";
      if (skills) {
        const SkillskeyArray = Array.isArray(skills)
          ? skills
          : skills.split(",").map((skill) => skill.trim());
          SkillsString = SkillskeyArray.join(",");
        }
  // let RespabString = "";
  //     if (responsb) {
  //       const RespabkeyArray = Array.isArray(responsb)
  //         ? responsb
  //         : responsb.split(",").map((respabb) => respabb.trim());
  //         RespabString = RespabkeyArray.join(",");
  //       }
  // let RequirString = "";
  //     if (requir) {
  //       const RequirkeyArray = Array.isArray(requir)
  //         ? requir
  //         : requir.split(",").map((requirb) => requirb.trim());
  //         RequirString = RequirkeyArray.join(",");
  //       }
  const jobData = {
    title,
    location,
    desc,
    responsb,
    deadline,
    department,
    skills:SkillsString,
    designation,
    type,
    requirements:requir,
    status,
    email
  };
  
  try {
    const job = new Job(jobData);
    await job.save();
    res.status(201).json({ message: 'Job created successfully' });
  } catch (error) {
    console.error('Error saving job:', error); // Detailed logging
    res.status(500).json({
      message: 'Error saving Job',
      error: error.message || error // Provide more detailed error message
    });
    
  }

};

// Get all Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Jobs', error });
  }
};

export const addJobApp = async (req, res) => {
  upload(req, res, async (err) => {
    const { name, phone, email,job} = req.body;
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File upload error: " + err.message });
      } else if (err) {
        return res.status(400).json({ message: "Error: " + err.message });
      }
  
    if (!name ) {
      return res.status(400).json({ message: "Name is required!" });
    }
  
    try {

      const updateData = {name, phone, email,job};
      const resume = req.file;
      if (resume.path) {
        updateData.resume = resume.path;
      }
      updateData.category = "job";
      const jobapp = new JobApp(updateData);
      
      await jobapp.save();
      const departmentRecord = await Job.findById(job).populate('department', 'id name email');
      
      if (!departmentRecord) {
        return res.status(404).json({ message: "Job not found" });
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
        Job: ${job}\n
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
        text: `Dear ${name},\n\nThank you applying for the ${job} position.\nWe have received your application and will be in touch shortly.\n\nBest regards,\nTeam`,
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(userMailOptions);
      res.status(201).json({ message: "Application created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving application "+error.message });
    }
});
};

// Get a single Job by ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    const jobapp = await JobApp.find({job:req.params.id});
    const jobWithCorrectImagePath = jobapp.map(jobappb => {
      const correctImagePath = jobappb.resume.replace(/\\+/g, '/');
      return {
        ...jobappb.toObject(),
        resume: `${correctImagePath}`
      };
    });
    if (!job) {
      return res.status(404).json({ message: 'job not found' });
    }
    res.json({job,jobapp:jobWithCorrectImagePath});
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving' + error.message });
  }
};

export const getJobByIdFront = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'job not found' });
    }
    res.json({job});
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving' + error.message });
  }
};

// Update a Job by ID
export const updateJob = async (req, res) => {
  const { title, location, desc,responsb,type,skills,deadline,department,designation,requir,category,status,email } = req.body;

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    let SkillsString = "";
      if (skills) {
        const SkillskeyArray = Array.isArray(skills)
          ? skills
          : skills.split(",").map((skill) => skill.trim());
          SkillsString = SkillskeyArray.join(",");
        }
    //     let RequirString = "";
    //     if (requir) {
    //       const RequirkeyArray = Array.isArray(requir)
    //         ? requir
    //         : requir.split(",").map((requirb) => requirb.trim());
    //         RequirString = RequirkeyArray.join(",");
    //       }
    if (title) job.title = title;
    if (email) job.email = email;
    if (location) job.location = location;
    if (desc) job.desc = desc;
    if (type) job.type = type;
    if (skills) job.skills = SkillsString;
    if (responsb) job.responsb = responsb;
    if (requir) job.requirements = requir;
    if (deadline) job.deadline = deadline;
    if (designation) job.designation = designation;
    if (department) job.department = department;
    if (status) job.status = status;    


    await job.save();
    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating Job', error });
  }
};

// Delete a Job by ID
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Job', error });
  }
};
