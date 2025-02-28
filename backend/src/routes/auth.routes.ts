import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller";
import upload from "../configs/upload.multer.config";

const authRouter = Router();

authRouter.post("/register", upload.single("profilePic"), registerController);
authRouter.post("/login", loginController);

export default authRouter;
