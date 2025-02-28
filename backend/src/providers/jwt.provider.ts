import jwt from "jsonwebtoken";
import { AppError } from "../constructors";
import { NextFunction } from "express";
import { Types } from "mongoose";
import { CatchErrorResponse } from "../utils";
const generateToken = async (userId: Types.ObjectId, next: NextFunction) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: "1d",
    });

    if (!token) {
      throw new AppError("Failed to generate token", 500);
    }

    return token;
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};

export default generateToken;
