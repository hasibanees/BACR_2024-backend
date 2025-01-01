import express from 'express';
import { addSocialLinks,getSocialLinks} from '../controllers/ContactDetailsController.js';

const router = express.Router();

router.post('/add-social', addSocialLinks);
router.get('/sociallinks', getSocialLinks);

export default router;