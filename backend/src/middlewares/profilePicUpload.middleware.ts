import { NextFunction, Request, Response } from "express";
import multer from "multer";
import upload from "../configs/uploadProfilePic.config";
import AppError from "../utils/AppError";

const handleImageUpload = (req: Request, res: Response, next: NextFunction) => {
  upload.single("profilePic")(req, res, (err: any) => {
    if (err) {
      // Handle Multer-specific errors (e.g., file size limit)
      if (err instanceof multer.MulterError) {
        next(
          new AppError(err.message || "Error uploading image to multer", 400)
        );
      }
      // Handle Cloudinary upload errors
      if (err instanceof Error) {
        next(
          new AppError(
            err.message || "Error uploading image to Cloudinary",
            500
          )
        );
      }
    }
    // Proceed to the next middleware if no errors
    next();
  });
};

export default handleImageUpload;
