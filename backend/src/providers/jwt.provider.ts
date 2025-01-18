import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import { NextFunction } from "express";
import { ObjectId, Types } from "mongoose";
const generateToken = async (userId: Types.ObjectId, next: NextFunction) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1d",
    });
    return token;
  } catch (error: any) {
    next(new AppError(`${error.message} - Unable to generate token`, 500));
  }
};

export default generateToken;
