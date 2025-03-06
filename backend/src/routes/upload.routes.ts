import { Router } from "express";
import upload from "../configs/upload.multer.config";
import {
  uploadImagesController,
  uploadSingleImageController,
} from "../controllers/uploadFile.controller";

const uploadRouter = Router();

// For Multiple Images Upload
uploadRouter.post("/images", upload.array("images"), uploadImagesController);
// For Single Image Upload
uploadRouter.post(
  "/image",
  upload.single("image"),
  uploadSingleImageController
);

export default uploadRouter;
