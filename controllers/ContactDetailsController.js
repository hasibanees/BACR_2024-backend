import multer from 'multer';
import SocialLinks from '../models/SocialLinks.js';
import path from 'path';
import { FooterStorage } from '../utils/fileUploder.js';

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/footercertificates"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
const storage=FooterStorage;
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
  { name: "certificate1", maxCount: 1 },
  { name: "certificate2", maxCount: 1 },
  { name: "certificate3", maxCount: 1 },
  { name: "certificate4", maxCount: 1 },
]);


export const addSocialLinks = async (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "Error: " + err.message });
    }
    const { whatsapp, facebook,whatsappno,youtube,telephone1,telephone2,email, instagram, linkedin,address1head,address2head,address3head,address4head,address1,address2,address3,address4,address1url,address2url,address3url,address4url } = req.body;
    const { files } = req;
    console.log(telephone1);
    console.log(whatsappno);
    
    try {
      // Check if a record already exists
      let socialLinks = await SocialLinks.findOne();
      const certificate1 = files?.certificate1?.[0]?.path || "";
      const certificate2 = files?.certificate2?.[0]?.path || "";
      const certificate3 = files?.certificate3?.[0]?.path || "";
      const certificate4 = files?.certificate4?.[0]?.path || "";
      if (socialLinks) {
        // If record exists, update it
        if(whatsapp) socialLinks.whatsapp = whatsapp;
        if(facebook) socialLinks.facebook = facebook;
        if(instagram) socialLinks.instagram = instagram;
        if(linkedin) socialLinks.linkedin = linkedin;
        if(youtube) socialLinks.youtube = youtube;
        if(whatsappno) socialLinks.whatsappno = whatsappno;
        if(telephone1) socialLinks.telephone1 = telephone1;
        if(telephone2) socialLinks.telephone2 = telephone2;
        if(email) socialLinks.email = email;
        if(address1) socialLinks.address1 = address1;
        if(address1head) socialLinks.address1head = address1head;
        if(address2head) socialLinks.address2head = address2head;
        if(address3head) socialLinks.address3head = address3head;
        if(address4head) socialLinks.address4head = address4head;
        if(address1url) socialLinks.address1url = address1url;
        if(address2) socialLinks.address2 = address2;
        if(address2url) socialLinks.address2url = address2url;
        if(address3) socialLinks.address3 = address3;
        if(address3url) socialLinks.address3url = address3url;
        if(address4) socialLinks.address4 = address4;
        if(address4url) socialLinks.address4url = address4url;
        if(certificate1 !== "") socialLinks.certificate1 = certificate1;
        if(certificate2 !== "") socialLinks.certificate2 = certificate2;
        if(certificate3 !== "") socialLinks.certificate3 = certificate3;
        if(certificate4 !== "") socialLinks.certificate4 = certificate4;
  
        await socialLinks.save();
        return res.status(200).json({ message: 'Social Links updated successfully', socialLinks });
      } else {
        socialLinks = new SocialLinks({ whatsapp, facebook, instagram, linkedin,youtube });
        await socialLinks.save();
        return res.status(201).json({ message: 'Social Links saved successfully', socialLinks });
      }
    } catch (err) {
      res.status(500).json({ message: 'Error saving Social Links'+err.message,  });
    }
  });
  };
  
  // Get all SocialLinks
export const getSocialLinks = async (req, res) => {
    try {
      const sociallinks = await SocialLinks.find();
      const correctedSocialLinks = sociallinks.map(link => ({
        ...link.toObject(), // Convert Mongoose object to plain object
        certificate1: link.certificate1 
          ? `${link.certificate1.replace(/\\+/g, '/')}` 
          : null,
        certificate2: link.certificate2 
          ? `${link.certificate2.replace(/\\+/g, '/')}` 
          : null,
        certificate3: link.certificate3 
          ? `${link.certificate3.replace(/\\+/g, '/')}` 
          : null,
        certificate4: link.certificate4 
          ? `${link.certificate4.replace(/\\+/g, '/')}` 
          : null,
      }));
      
      res.status(200).json(correctedSocialLinks);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving social links messages', error });
    }
  };