import { NextFunction, Request, Response } from "express";
import { AppError } from "../constructors";
import { CatchErrorResponse, SuccessResponse } from "../utils";
import imageUploader from "../utils/imageUploader";

export const uploadImagesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !(req.files instanceof Array)) {
      throw new AppError("No files uploaded", 400);
    }

    const files = req.files as Express.Multer.File[];

    const uploadPromises = files.map(async (file) => {
      const result = await imageUploader({
        file,
        folder: req?.body?.folderName,
      });

      return {
        cloudUrl: result.secure_url,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    SuccessResponse(res, 200, "Images uploaded successfully", {
      uploadedImages,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export const uploadSingleImageController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const result = await imageUploader({
      file: req.file,
      folder: req?.body?.folderName,
    });

    SuccessResponse(res, 200, "Image uploaded successfully", {
      cloudUrl: result.secure_url,
    });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
