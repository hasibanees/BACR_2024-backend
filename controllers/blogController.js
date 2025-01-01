import Blog from "../models/Blog.js";
import BlogTag from '../models/BlogTag.js';
import generateSitemap from '../Traits/Sitemap.js';
import extractEmailsFromExcel from '../Traits/extractEmail.js';
import Tag from '../models/Tag.js';
import multer from "multer";
import fs from 'fs';
import path from "path";
import nodemailer from "nodemailer";
import schedule from "node-schedule";
import xml2js from 'xml2js';
import { BlogStorage } from "../utils/fileUploder.js";
import { identitytoolkit_v3 } from "googleapis";

const storage =BlogStorage;
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === 'image') {
//       cb(null, 'uploads/blogs'); // Save images in blogs folder
//     } else if (file.fieldname === 'email') {
//       cb(null, 'uploads/temp'); // Save Excel files in temporary storage
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });
// const emailStorage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (file.fieldname === 'image') {
//       BlogStorage
//     } else if (file.fieldname === 'email') {
//       cb(null, 'uploads/temp'); // Save Excel files in temporary storage
//     }
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//   },
// });


const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const isImage = /jpeg|jpg|png/.test(file.mimetype);
    // const isExcelFile = file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    // const isCSVFile = file.mimetype === "text/csv";
    // if ((file.fieldname === "image" && isImage) || (file.fieldname === "email" && (isExcelFile || isCSVFile))) {
    //   cb(null, true);
    // } else {
    //   cb(new Error("Only images (JPEG, JPG, PNG) and Excel files (XLSX) are allowed"));
    // }
    if ((file.fieldname === "image" && isImage)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (JPEG, JPG, PNG) and Excel files (XLSX) are allowed"));
    }
    
  },
}).fields([
  { name: "image", maxCount: 1 }, // For the blog image
  // { name: "email", maxCount: 1 }, // For the Excel file with emails
]);


// Create a new blog
export const createBlog = async (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        // File size exceeded: send 500 error
        return res.status(500).json({ message: "File size exceeds 5MB limit" });
      }
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
    
    let { name,url, description,categoryId,tags,emails, focus_keys,alt_text,caption_img,meta_desc,meta_title,can_url,status,schedule_time,soc_tags,excerpt } = req.body;
    const { files } = req;
    const image = files?.image[0];
    

    if (!name || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if(status!=="schedule"){
      schedule_time='';
    }
    if(!url ){
      url='/blog/'+name;
    }
      // Validate and process emails
      let focuskeyString = "";
      if (focus_keys) {
        const focuskeyArray = Array.isArray(focus_keys)
          ? focus_keys
          : focus_keys.split(",").map((focus_key) => focus_key.trim());
          focuskeyString = focuskeyArray.join(",");
        }
      let socTagsString = "";
      if (soc_tags) {
        const soctagskeyArray = Array.isArray(soc_tags)
          ? soc_tags
          : soc_tags.split(",").map((soc_tag) => soc_tag.trim());
          socTagsString = soctagskeyArray.join(",");
        }
      
      let emailString = "";
      let excelFile;

      if (emails) {
        const emailArray = Array.isArray(emails)
          ? emails
          : emails.split(",").map((email) => email.trim());
        
        // Validate email format
        const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const invalidEmails = emailArray.filter((email) => !isValidEmail(email));
  
        if (invalidEmails.length > 0) {
          return res.status(400).json({ message: `Invalid emails: ${invalidEmails.join(", ")}` });
        }
  
        emailString = emailArray.join(","); // Save as comma-separated string
      }
      // const email = await extractEmailsFromExcel(excelFile.path);
      // if(files.email){
      //  excelFile = files?.email[0];
    
      // const excelBuffer = fs.readFileSync(excelFile?.path);
      // const excelBuffer = excelFile?.path;
      // const { validEmails, invalidEmails } = extractEmailsFromExcel(excelBuffer);

      
      // if (validEmails.length === 0) {
      //   return res.status(400).json({ message: "No valid emails found in the Excel file." });
      // }
      //  emailString = validEmails.join(',');
             
//  // Send email notifications to each email in the list
 const transporter = nodemailer.createTransport({
  // host: process.env.MAIL_HOST,
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  secure: false, // use SSL
  auth: {
    user: 'bc706f92abe244',
    pass: 'daf333647f2f6a',
  }
});



      // fs.unlinkSync(excelFile.path);

    // }
    try {
      let uniqueUrl = url;
      let suffix = 1; // Start suffix from 1

      // Check for existing URLs and generate a new one if necessary
      while (await Blog.findOne({ url: uniqueUrl })) {
        uniqueUrl = `${url}-${suffix}`;
        suffix++;
      }
      const blog = new Blog({
        name,
        url:uniqueUrl,
        categoryId,
        description,
        imagePath: image?.path ? image?.path :"",
        emails: emailString,
        focus_key:focuskeyString,
        alt_text,
        caption_img,
        meta_desc,
        meta_title,
        can_url,
        soc_tags:socTagsString,
        status,
        schedule_time,
        excerpt
      });

      await blog.save();

      if(emails){
      const mailOptions = {
        from: 'info@bacr.com.pk',  // Your Gmail address
        subject: 'New Blog Post: ' + name,
        html: `
          <h1>New Blog Post</h1>
          <p>A new blog post has been created: <strong>${name}</strong></p>
          <p>Click here to read more: <a href="${uniqueUrl}">${uniqueUrl}</a></p>
        `,
        };
      
      // Send email to each recipient
      const emailPromises = emailString.split(',').map((email) => {
        return transporter.sendMail({ ...mailOptions, to: email });
      });
            // Wait for all emails to be sent
            await Promise.all(emailPromises);
    }
      // Process tags (assuming `tags` is a comma-separated string or an array of tag IDs)
      if(tags){
      const tagArray = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim());

      // Create BlogTag entries
      
      const blogTagPromises = tagArray.map((tagId) => {
        return BlogTag.create({
          blogId: blog._id,
          tagId,
        });
      });
      await Promise.all(blogTagPromises);
    }
      const postId=blog._id;
      if(status==="schedule"){
       if (!schedule_time || isNaN(new Date(schedule_time).getTime())) {
    throw new Error("Invalid schedule time provided.");
  }

  try {
    // Schedule the post
    await schedulePost(postId, schedule_time); // Assuming schedulePost returns a Promise
  } catch (error) {
    console.error("Error scheduling the post:", error.message);
  }
      }

      await generateSitemap();
      res.status(201).json({ message: "Blog created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error saving blog"+ error.message });
    }
  });
};

export const getRelatedBlogs = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch related blogs excluding the current blog
    const blogs = await Blog.find({ _id: { $ne: id } ,
    status: "publish"}) // Use id from params
      .populate('categoryId', 'name')
      .limit(5);

    // Fetch additional details for each blog
    const blogsWithDetails = await Promise.all(
      blogs.map(async (blog) => {
        const correctImagePath = blog.imagePath.replace(/\\+/g, '/');

        // Fetch associated tags using BlogTag bridge
        const blogTags = await BlogTag.find({ blogId: blog._id }).populate('tagId');
        const tags = blogTags.map((bt) => bt.tagId); // Extract the tags

        return {
          ...blog.toObject(),
          imagePath: `${correctImagePath}`,
          tags,
        };
      })
    );

    // Internal Linking Strategies and Related Posts
    const strategies = blogsWithDetails.map((blog) => ({
      id: blog._id,
      title: blog.name,
      url: `/blog-detail/${blog.url}`,
      imagePath: blog.imagePath,
      excerpt: blog.excerpt,
    }));

    res.status(200).json({
      blogs: blogsWithDetails,
      strategies: {
        internalLinkingSuggestions: strategies.slice(0, 3), // Suggest first 3 for internal linking
        relatedPosts: strategies.slice(3), // Suggest the rest as related posts
      },
    });
  } catch (error) {
    console.error("Error retrieving blogs:", error); // Log the error for better visibility
    res.status(500).json({ message: "Error retrieving blogs", error: error.message });
  }
};

const schedulePost = (postId, scheduleTime) => {
  schedule.scheduleJob(new Date(scheduleTime), async () => {
    await Blog.findByIdAndUpdate(postId, {status:"published"}, { new: true });
  });
};

export const getAllBlogsUrl = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "publish" }).select("url");
    res.status(200).json({ blogs:blogs });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving blogs "+error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; 
  try {
    const skip = (page - 1) * limit;
    const blogs = await Blog.find({ status: "publish" })
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 }) // Optional: Sort by latest blogs
    .skip(skip) // Skip blogs for pagination
    .limit(parseInt(limit));

    const totalBlogs = await Blog.countDocuments(); // Get total number of blogs
    const totalPages = Math.ceil(totalBlogs / limit); 
    const blogsWithDetails = await Promise.all(
      blogs.map(async (blog) => {
        const correctImagePath = blog.imagePath.replace(/\\+/g, '/');
        
        // Fetch associated tags using BlogTag bridge
        const blogTags = await BlogTag.find({ blogId: blog._id }).populate('tagId');
        const tags = blogTags.map((bt) => bt.tagId); // Extract the tags
        
        return {
          ...blog.toObject(),
          imagePath: `${correctImagePath}`,
          tags, // Include tags in the response          
        };
      })
    );
    res.status(200).json({ blogs:blogsWithDetails, pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalBlogs,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
  }, });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving blogs "+error.message });
  }
};


export const getAllBlogsBack = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "publish" }) 
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 });
    const blogsWithDetails = await Promise.all(
      blogs.map(async (blog) => {
        const correctImagePath = blog.imagePath.replace(/\\+/g, '/');
        
        // Fetch associated tags using BlogTag bridge
        const blogTags = await BlogTag.find({ blogId: blog._id }).populate('tagId');
        const tags = blogTags.map((bt) => bt.tagId); // Extract the tags
        
        return {
          ...blog.toObject(),
          imagePath: `${correctImagePath}`,
          tags, // Include tags in the response          
        };
      })
    );
    res.status(200).json({ blogs:blogsWithDetails});
  } catch (error) {
    res.status(500).json({ message: "Error retrieving blogs "+error.message });
  }
};
// Get a single blog by ID
export const getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blogs = await Blog.findOne({url:id}).populate('categoryId', 'name');
    if (!blogs) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const correctImagePath = blogs.imagePath ? blogs.imagePath.replace(/\\+/g, '/') : `${process.env.url}/upload/thumbnail.jpeg`;
    
    // Fetch associated tags using BlogTag bridge
    const blogTags = await BlogTag.find({ blogId: blogs._id }).populate('tagId');
    const tags = blogTags.map((bt) => bt.tagId); // Extract the tags
    
    const blogWithDetails = {
      ...blogs.toObject(),
      imagePath: `${correctImagePath}`,
      tags, // Include tags in the response
    };
    
    res.status(200).json({ blog: blogWithDetails });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving blog "+error.message  });
  }
};

// Update blog information by ID
export const updateBlog = async (req, res) => {
  const { id } = req.params;

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }

    let { name,url, description,emails,categoryId,tags,focus_keys,alt_text,caption_img,meta_desc,meta_title,can_url,status,schedule_time,soc_tags,excerpt } = req.body;
    const { files } = req;
    
    let imagePath = '';
    if (files && files.image && files.image[0]) {
      const image = files.image[0];
      imagePath = image.path;
    }
    // let emailString = '';
    // let excelFile = '';
  //   if (files && files.email && files.email[0]) {
  //    excelFile = files.email[0];
  //   const excelBuffer = fs.readFileSync(excelFile.path);
  //   const { validEmails, invalidEmails } = extractEmailsFromExcel(excelBuffer);
  //   if (validEmails.length === 0) {
  //     return res.status(400).json({ message: "No valid emails found in the Excel file." });
  //   }
    
  //   emailString = validEmails.join(',');
  // }  
    let uniqueUrl = url;
    let suffix = 1; // Start suffix from 1
    // Check for existing URLs and generate a new one if necessary
    while (await Blog.findOne({ url: uniqueUrl,_id: { $ne: id } })) {
      uniqueUrl = `${url}-${suffix}`;
      suffix++;
    }
    const updateData = {};
    if (name) updateData.name = name;
    if(!url ){
      updateData.url=name;
    }else{
      updateData.url = uniqueUrl;
    }
    if (description) updateData.description = description;
    if (imagePath) updateData.imagePath = imagePath;
    if (categoryId) updateData.categoryId = categoryId;
    if(status!=="schedule"){
      schedule_time='';
    }
    let focuskeyString = "";
    if (focus_keys) {
      const focuskeyArray = Array.isArray(focus_keys)
        ? focus_keys
        : focus_keys.split(",").map((focus_key) => focus_key.trim());
        focuskeyString = focuskeyArray.join(",");
      }
    let emailsString = "";
    if (emails) {
      const emailsArray = Array.isArray(emails)
        ? emails
        : emails.split(",").map((email) => email.trim());
        emailsString = emailsArray.join(",");
      }
    let socTagsString = "";
    if (soc_tags) {
      const soctagskeyArray = Array.isArray(soc_tags)
        ? soc_tags
        : soc_tags.split(",").map((soc_tag) => soc_tag.trim());
        socTagsString = soctagskeyArray.join(",");
      }

    
    if (emailsString) updateData.emails = emailsString;
    if (soc_tags) updateData.soc_tags = socTagsString;
    if (focus_keys) updateData.focus_keys = focuskeyString;
    if (meta_desc) updateData.meta_desc = meta_desc;
    if (caption_img) updateData.caption_img = caption_img;
    if (alt_text) updateData.alt_text = alt_text;
    if (meta_title) updateData.meta_title = meta_title;
    if (can_url) updateData.can_url = can_url;
    if (excerpt) updateData.excerpt = excerpt;
    if (status) updateData.status = status;

      // Process `tags` field
      
    try {
      // Update blog details
      const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedBlog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      // Process tags if provided
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(",").map(tag => tag.trim());

        // Remove old BlogTag entries
        await BlogTag.deleteMany({ blogId: id });

        // Add new BlogTag entries
        const blogTagPromises = tagArray.map((tagId) => {
          return BlogTag.create({
            blogId: id,
            tagId,
          });
        });
        await Promise.all(blogTagPromises);
      }
      await generateSitemap();
    //   if(excelFile){
    //   fs.unlinkSync(excelFile.path);
    // }
      res.status(200).json({ message: "Blog updated successfully", updatedBlog });    
    } catch (error) {
      res.status(500).json({ message: "Error updating blog"+ error.message });
    }
  });
};

// Delete a blog by ID
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting blog", error });
  }
};
