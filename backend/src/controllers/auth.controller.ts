import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import generateToken from "../providers/jwt.provider";
import { User } from "../models";

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
      message: "User registered successfully",
      token: token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default registerController;
