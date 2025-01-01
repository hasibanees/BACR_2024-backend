import express from "express"
import multer from "multer"
import {deleteTeamMember,updateTeamMember,getTeamMemberById,createTeamMember,getAllTeamMembers} from "../controllers/TeamController.js"

const router = express.Router();

// Define routes
router.post('/team', createTeamMember);
router.get('/team', getAllTeamMembers);
router.get('/team/:id', getTeamMemberById);
router.put('/team/:id', updateTeamMember);
router.delete('/team/:id', deleteTeamMember);

export default router;
