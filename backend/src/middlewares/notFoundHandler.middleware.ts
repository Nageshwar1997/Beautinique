import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
// import AppError from "../utils/AppError";

// Middleware to handle undefined routes
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

export default notFoundHandler;
