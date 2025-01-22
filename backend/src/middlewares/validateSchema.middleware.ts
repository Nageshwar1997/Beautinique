import { Request, Response, NextFunction } from "express";
import mongoose, { Model } from "mongoose";
import AppError from "../utils/AppError";

const validateMongooseSchema = (model: Model<any>) => {
  return async (
    req: Request,
    _: Response, // _ is the req object
    next: NextFunction
  ) => {
    try {
      const tempDoc = new model(req.body);
      await tempDoc.validate(); // Trigger schema validation
      return next();
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map(
          (error) => error?.message ?? ""
        );
        return next(new AppError(messages.join(", "), 400));
      } else {
        return next(new AppError("An unexpected error occurred", 500));
      }
    }
  };
};

export default validateMongooseSchema;
