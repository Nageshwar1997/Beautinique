import { Request, Response, NextFunction } from "express";
import { AppError } from "../constructors";

// Middleware to handle undefined routes
const notFoundHandler = (req: Request, _: Response, next: NextFunction) => {
  return next(
    new AppError(`Cannot find ${req.originalUrl} on this server`, 404)
  );
};

export default notFoundHandler;
