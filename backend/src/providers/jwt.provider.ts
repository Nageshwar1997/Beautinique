import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import { NextFunction } from "express";
import { Types } from "mongoose";
const generateToken = async (userId: Types.ObjectId, next: NextFunction) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? `${error.message} - Unable to generate token`
        : "Unable to generate token due to an unknown error";
    return next(new AppError(errorMessage, 500));
  }
};

export default generateToken;
