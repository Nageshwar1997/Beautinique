import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

const uploadProfilePicController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profilePicUrl = req.file?.path; // URL of the uploaded image

    if (!profilePicUrl) {
      return next(new AppError("Profile picture not uploaded", 400));
    }

    res.status(200).json({
      success: true,
      error: false,
      message: "Profile picture uploaded successfully",
      imageUrl: profilePicUrl,
    });
  } catch (error: any) {
    next(new AppError(error.message, 500));
  }
};

export default uploadProfilePicController;
