import { NextFunction, Request, Response } from "express";
import cloudinary from "../configs/cloudinary/cloudinary.config";
import AppError from "../utils/AppError";

const uploadProfilePicController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const mainFolder = "Beauty_Shop";
    const subFolder = req.body.folder.split(" ").join("_") || "Common_Folder";

    const finalFolder = `${mainFolder}/${subFolder}`;
    const publicId = `${req?.file?.originalname
      .split(" ")
      .join("_")
      .split(".")
      .slice(0, -1)
      .join("")}-${Date.now().toString()}`;

    // Wrap Cloudinary upload_stream in a Promise
    await new Promise<any>((resolve: any, reject: any) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: finalFolder,
            public_id: publicId,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
          },
          (error, result) => {
            if (error) {
              return reject({ message: "Error uploading file from reject" });
            } else {
              return resolve(result);
            }
          }
        )
        .end(req?.file?.buffer); // Upload the file buffer to Cloudinary
    }).then((data) => {
      return res.status(201).json({
        success: true,
        error: false,
        message: "Image uploaded successfully",
        imageUrl: data.secure_url,
      });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to upload image due to an unknown error";
    return next(new AppError(errorMessage, 500));
  }
};

export default uploadProfilePicController;
