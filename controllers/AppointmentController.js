import Appointment from '../models/Appointment.js';
import nodemailer from "nodemailer";

export const createContactMessage = async (req, res) => {
  const { name, email,phone, date } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and Email field is required' });
  }
  if (!date || new Date(date) <= new Date()) {
    return res.status(400).json({ message: 'Please select a valid date after today.' });
  }
  
  try {
    const appointment = new Appointment({ name, email,phone, date });
    await appointment.save();
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
      subject: 'Appointment Booking',
      html: `
        <h1>Thanks for book an appointment </h1>
      `,
    };
    
      await transporter.sendMail({ ...mailOptions, to: email });
    res.status(201).json({ message: 'Appointment message saved successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Error saving contact message '+ error.message });
  }
};

export const getAllContactMessages = async (req, res) => {
  try {
    const contacts = await Appointment.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving contact messages', error });
  }
};
