import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import generateToken from "../providers/jwt.provider";
import { User } from "../models";
import AppError from "../utils/AppError";
import { isValidPassword } from "../validators/user.validator";
import SuccessResponse from "../middlewares/SuccessHandler.middleware";

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, profilePic, phoneNumber } =
      req.body;

    if (!password) {
      return next(new AppError("Password is required", 400));
    } else if (password) {
      if (!isValidPassword(password)) {
        return next(
          new AppError(
            "Password must be at least 6 characters long and contain at least one letter, one number, and one special character",
            400
          )
        );
      }
    }

    const hashPassword = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      ...req.body,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password: hashPassword,
      profilePic,
    });

    const token = await generateToken(user?._id, next);

    if (!token) {
      return next(new AppError("Error generating token", 500));
    }

    SuccessResponse(res, 201, "User registered successfully", {
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    });

    return;
  } catch (err: any) {
    next(new AppError(err.message || "Error registering user", 500));
  }
};

export default registerController;
