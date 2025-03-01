import { NextFunction, Request, Response } from "express";
import { AppError } from "../constructors";
import { CatchErrorResponse, isValidMongoId, SuccessResponse } from "../utils";
import { User } from "../models";
import { getUserIdFromToken } from "../services/user.service";
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserIdFromToken(req, next);

    const isValid = isValidMongoId(userId as string);

    if (!isValid) {
      throw new AppError("Invalid MongoDB userId", 400);
    }

    const user = await User.findById(userId).select("-password").lean();

    console.log("user", user);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    SuccessResponse(res, 200, "User fetched successfully", { user });
  } catch (error) {
    return CatchErrorResponse(error, next);
  }
};
