import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

const errorHandler = (err: AppError, _: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: true,
    status: statusCode,
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
