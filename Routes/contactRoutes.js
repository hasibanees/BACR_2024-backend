import express from 'express';
import { createContactMessage,updateContact,downloadContactMessages, getAllContactMessages, deleteContactMessage,getContactById } from '../controllers/contactController.js';

const router = express.Router();

// Route to create a new contact message
router.post('/contact', createContactMessage);
router.get('/contacts', getAllContactMessages);
router.get('/contact/:id', getContactById);
router.put('/contact/:id', updateContact);
router.get('/download-contact', downloadContactMessages);
router.delete('/contact/:id', deleteContactMessage);

export default router;