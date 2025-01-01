import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    linkedin: { type: String },    
    youtube: { type: String },    
    instagram: { type: String },    
    facebook: { type: String },    
    whatsapp: { type: String },    
    whatsappno: { type: String },    
    telephone1: { type: String },    
    telephone2: { type: String },    
    email: { type: String },    
    address1head: { type: String },    
    address1: { type: String },    
    address1url: { type: String },    
    address2: { type: String },    
    address2head: { type: String },    
    address2url: { type: String },    
    address3head: { type: String },    
    address3: { type: String },    
    address3url: { type: String },    
    address4: { type: String },    
    address4head: { type: String },    
    address4url: { type: String },    
    certificate1: { type: String },    
    certificate2: { type: String },    
    certificate3: { type: String },    
    certificate4: { type: String },    
  },
  { timestamps: true }
);

const SocialLinks = mongoose.model("SocialLinks", socialSchema);
export default SocialLinks;