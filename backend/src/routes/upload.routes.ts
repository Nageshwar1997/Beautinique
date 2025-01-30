import { Router } from "express";
import multer from "multer";
import uploadProfilePicController from "../controllers/uploadImage.controller";

const uploadRouter = Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Async upload handler
uploadRouter.post(
  "/profile-pic",
  upload.single("profilePic"),
  uploadProfilePicController
);

export default uploadRouter;
