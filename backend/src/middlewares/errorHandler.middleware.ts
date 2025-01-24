import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const ErrorHandler = (
  err: AppError,
  _: Request, // _ is the request object
  res: Response,
  __: NextFunction // __ is the next function
) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: true,
    status: statusCode,
    message: err?.message || "Internal Server Error",
  });
  return;
};

export default ErrorHandler;
