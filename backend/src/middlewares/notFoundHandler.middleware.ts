import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

// Middleware to handle undefined routes
const NotFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server`, 404)
  );
};

export default NotFoundHandler;
