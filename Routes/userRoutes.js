import express from "express"
import {signUp,Login, getAllusers} from "../controllers/userController.js";

const router = express.Router();


router.post("/signup",signUp);
router.post("/login",Login);
router.get("/users",getAllusers);

export default router;