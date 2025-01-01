import Contact from '../models/Contact.js';
import XLSX from "xlsx";
import SocialLinks from '../models/SocialLinks.js';
import { __dirname } from '../server.js';
import PDFDocument from "pdfkit";
import fs from "fs";
import path from 'path';
import nodemailer from "nodemailer";
import Appointment from '../models/Appointment.js';

// Create a new contact message
export const createContactMessage = async (req, res) => {
  const { name, email,phone, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email field is required' });
  }
  try {
    const contact = new Contact({ name, email,phone, message });
    await contact.save();
    const transporter = nodemailer.createTransport({
          // host: process.env.MAIL_HOST,
          host: 'sandbox.smtp.mailtrap.io',
          port: 587,
          secure: false, // use SSL
          auth: {
            user: process.env.SERVERNAME,
            pass: process.env.PASSWORD,
          }
        });
        
        const mailOptions = {
          from: 'info@bacr.com.pk',  // Your Gmail address
          subject: 'Contact Us',
          html: `
            <h1>Thankyou for contacting us!</h1>
          `,
        };
        
         await  transporter.sendMail({ ...mailOptions, to: email });
    res.status(201).json({ message: 'Contact message saved successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Error saving contact message'+ error.message });
  }
};

// Get all SocialLinks
export const getSocialLinks = async (req, res) => {
  try {
    const sociallinks = await SocialLinks.find();
    res.status(200).json(sociallinks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving social links messages', error });
  }
};

export const getAllContactMessages = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contact messages', error });
  }
};

export const getContactById = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ contact });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving contact", error });
  }
};

export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name,email,message,phone } = req.body;
  try {
    
    const updatedContact = await Contact.findByIdAndUpdate(id, {name,email,phone,message}, { new: true });
    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact updated successfully", updatedContact });
  } catch (error) {
    res.status(500).json({ message: "Error updating contact"+ error.message });
  }
};

// Delete a contact message by ID
export const deleteContactMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    res.status(200).json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact message', error });
  }
};

export const downloadContactMessages = async (req, res) => {
  try {
    const contacts = await Appointment.find();

    // Convert the contact messages to a format compatible with xlsx
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const filePath = path.join(__dirname, "ContactMessages.pdf");
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Document title
    doc.fontSize(18).text("Contact Messages", { align: "center" });
    doc.moveDown(1);
    const tableStartY = doc.y;
    // Define column positions and widths
    const columnPositions = { 
      serial: 40, 
      name: 80, 
      email: 230, 
      date: 380 
    };
    const columnWidths = { 
      serial: 40, 
      name: 150, 
      email: 200, 
      date: 100 
    };
    const rowHeight = 30;
    
    // Header row
    doc.rect(30, tableStartY, 550, rowHeight).fill("#f0f0f0").stroke();
    doc.fontSize(12).fill("black");
    
    // Add headers
    doc.text("S.No", columnPositions.serial, tableStartY + 10, { width: columnWidths.serial, align: "center" });
    doc.text("Name", columnPositions.name, tableStartY + 10, { width: columnWidths.name, align: "center" });
    doc.text("Email", columnPositions.email, tableStartY + 10, { width: columnWidths.email, align: "center" });
    doc.text("Date", columnPositions.date, tableStartY + 10, { width: columnWidths.date, align: "center" });
    doc.moveDown();
    
    let currentY = doc.y;
    
    // Content rows with serial numbers
    contacts.forEach((contact, index) => {
      // Draw row borders
      doc.rect(30, currentY, 550, rowHeight).stroke();
    
      // Add serial number and text for each column
      doc.text(index + 1, columnPositions.serial, currentY + 8, { width: columnWidths.serial, align: "center" });
      doc.text(contact.name || "N/A", columnPositions.name, currentY + 8, { width: columnWidths.name, align: "left" });
      doc.text(contact.email || "N/A", columnPositions.email, currentY + 8, { width: columnWidths.email, align: "left" });
      doc.text(contact.date.split('T')[0] || "N/A", columnPositions.date, currentY + 8, { width: columnWidths.date, align: "left" });
    

      // Move to the next row
      currentY += rowHeight;

      // Add a page if rows exceed the current page height
      if (currentY + rowHeight > doc.page.height - 30) {
        doc.addPage();
        currentY = 30; // Reset Y position for the new page
      }
    });

    // End the document and send the file as a response
    doc.end();
    stream.on("finish", () => {
      res.download(filePath, "ContactMessages.pdf", err => {
        if (err) {
          res.status(500).json({ message: "Error downloading file", error: err });
        }

        // Delete the file after download
        fs.unlinkSync(filePath);
      });
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error generating Excel file"+ error });
  }
};