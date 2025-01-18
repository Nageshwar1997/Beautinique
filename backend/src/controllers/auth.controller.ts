import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import User from "../models";
import generateToken from "../providers/jwt.provider";
import AppError from "../utils/AppError";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
} from "../validators/user.validator";

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, profileImage, DOB } =
      req.body;

    if (!firstName) {
      return next(new AppError("First name is required", 400));
    }

    if (firstName && !isValidName(firstName)) {
      return next(
        new AppError("First name must contain only letters and one space", 400)
      );
    }

    if (!lastName) {
      return next(new AppError("Last name is required", 400));
    }

    if (lastName && !isValidName(lastName)) {
      return next(
        new AppError("Last name must contain only letters and one space", 400)
      );
    }

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    if (email && !isValidEmail(email)) {
      return next(new AppError("Enter a valid email address", 400));
    }

    if (!password) {
      return next(new AppError("Password is required", 400));
    }

    if (password && !isValidPassword(password)) {
      return next(
        new AppError(
          "Password must be at least 6 characters long and contain at least one letter, one number, and one special character",
          400
        )
      );
    }

    const isUserExist = await User.countDocuments({ email: email.trim() });

    if (isUserExist) {
      return next(
        new AppError(`User already exists with this email ${email.trim()}`, 400)
      );
    }

    const hashPassword = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      ...req.body,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      profileImage,
      password: hashPassword,
    });

    const token = await generateToken(user?._id, next);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default registerController;
