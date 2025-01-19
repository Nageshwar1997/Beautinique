import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import generateToken from "../providers/jwt.provider";
import { User } from "../models";
import AppError from "../utils/AppError";

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, profilePic, phoneNumber } =
      req.body;

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

    res.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully",
      token: token,
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
  } catch (err:any) {
    next(new AppError(err.message || "Error registering user", 500));
  }
};

export default registerController;
