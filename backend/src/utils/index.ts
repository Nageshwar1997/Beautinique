import { NextFunction, Request, Response } from "express";
import { AppError, AppSuccess } from "../constructors";
import { ObjectSchema } from "joi";
import { Types } from "mongoose";

export const SuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: object
) => {
  const response = new AppSuccess(message, data);
  return res.status(statusCode).json({
    success: true,
    error: false,
    ...response,
  });
};

export const CatchErrorResponse = (error: unknown, next: NextFunction) => {
  if (error instanceof AppError) {
    return next(error); // Pass existing AppError without changing status code
  }
  return next(
    new AppError(
      "Something went wrong! Please try again", // Generic message for unknown errors
      500
    )
  );
};

export const validateSchema = (schema: ObjectSchema) => {
  return (req: Request, _: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // Joi error ko readable banane ke liye
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }
    next();
  };
};

export const isValidMongoId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};
