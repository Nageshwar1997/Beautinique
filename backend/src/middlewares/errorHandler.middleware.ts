import { NextFunction, Request, Response } from "express";
import { AppError } from "../constructors";

// Error Handling in Development
const handleDevelopmentError = (err: AppError, res: Response) => {
  //   res.setHeader("Content-Type", "application/json"); // Force JSON output
  res.status(err.statusCode).json({
    success: false,
    error: true,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
  });
};

// Production Error Handling
const handleProductionError = (err: AppError, res: Response) => {
  if (err.isOperational) {
    // Operational Error: Safe to show to client
    res.status(err.statusCode).json({
      success: false,
      error: true,
      message: err.message,
      statusCode: err.statusCode,
    });
  } else {
    // Unknown Error: Don't leak details to the client
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      error: true,
      message: "Something went wrong!",
    });
  }
};

// Main Error Handler Middleware
const errorHandler = (
  err: AppError,
  _: Request,
  res: Response,
  __: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    handleDevelopmentError(err, res);
  } else {
    handleProductionError(err, res);
  }
};

export default errorHandler;
