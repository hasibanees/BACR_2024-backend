import express from 'express';
import { createContactMessage,getAllContactMessages } from '../controllers/AppointmentController.js';

const router = express.Router();

router.post('/appointment', createContactMessage);
router.get('/appointments', getAllContactMessages);

export default router;