import express from 'express';
import { createSubscriber,getSubscriber,updateSubscriber,getSubscriberById,downloadContactMessages,deleteSubscriber} from '../controllers/subscriberController.js';

const router = express.Router();

router.post('/subscriber', createSubscriber);
router.get('/subscribers', getSubscriber);
router.put('/subscriber/:id', updateSubscriber);
router.get('/subscriber/:id', getSubscriberById);
router.get('/download-subscribers', downloadContactMessages);
router.delete("/subscriber/:id", deleteSubscriber);  
export default router;