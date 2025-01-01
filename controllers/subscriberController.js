import Subscriber from "../models/Subscriber.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from 'path';
import { __dirname } from '../server.js';

// Create a new subscriber
export const createSubscriber = async (req, res) => {

    const { email } = req.body;    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(404).json({ message: 'Email already exists' });
    }
    try {
      const subscriber = new Subscriber({
        email,
      });
      await subscriber.save();
      res.status(201).json({ message: "Subscriber created successfully", subscriber });
    } catch (error) {
      res.status(500).json({ message: "Error saving client", error });
    }
};

export const getSubscriberById = async (req, res) => {
  const { id } = req.params;

  try {
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    res.status(200).json({ subscriber });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving subscriber", error });
  }
};

export const updateSubscriber = async (req, res) => {
  const { id } = req.params;
  const { name,email,message,phone } = req.body;
  try {
    
    const updatedSubscriber = await Subscriber.findByIdAndUpdate(id, {name,email,phone,message}, { new: true });
    if (!updatedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found" });
    }
    res.status(200).json({ message: "Subscriber updated successfully", updatedSubscriber });
  } catch (error) {
    res.status(500).json({ message: "Error updating contact"+ error.message });
  }
};

export const getSubscriber = async (req, res) => {
        try {
          const subscribers = await Subscriber.find();
          res.status(200).json(subscribers);
        } catch (error) {
          res.status(500).json({ message: 'Error retrieving subscribers messages', error });
        }
};

// Delete a contact message by ID
export const deleteSubscriber = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);
    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Subcriber message not found' });
    }
    res.status(200).json({ message: 'Subcriber message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscriber message'+ error.message });
  }
};


export const downloadContactMessages = async (req, res) => {
  try {
    const contacts = await Subscriber.find();

    // Convert the contact messages to a format compatible with xlsx
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const filePath = path.join(__dirname, "Subscribers.pdf");
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Document title
    doc.fontSize(18).text("Subscribers", { align: "center" });
    doc.moveDown(1);
    const tableStartY = doc.y;
    // Define column positions and widths
    const columnPositions = { sno: 50, email: 200};
    const columnWidths = { sno: 150, email: 200};
    const rowHeight = 30;

    // Header row
    doc.rect(30, tableStartY, 550, rowHeight).fill("#f0f0f0").stroke();
    doc.fontSize(12).fill("black");
    doc.text("Sr No", columnPositions.sno, tableStartY + 10, { width: columnWidths.sno, align: "center" });
    doc.text("Email", columnPositions.email, tableStartY + 10, { width: columnWidths.email, align: "center" });

    doc.moveDown();

    let currentY = doc.y;

    // Content rows
    contacts.forEach((contact,index) => {
      // Draw row borders
      doc.rect(30, currentY, 550, rowHeight).stroke();
      const sno=index+1;
      // Add text for each column
      doc.text(sno || "N/A", columnPositions.sno, currentY + 8, { width: columnWidths.sno, align: "left" });
      doc.text(contact.email || "N/A", columnPositions.email, currentY + 8, { width: columnWidths.email, align: "left" });

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
      res.download(filePath, "Subscribers.pdf", err => {
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