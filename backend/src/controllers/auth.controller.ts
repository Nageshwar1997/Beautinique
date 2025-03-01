import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import generateToken from "../providers/jwt.provider";
import { AppError } from "../constructors";
import { CatchErrorResponse, SuccessResponse } from "../utils";
import { User } from "../models";
import imageUploader from "../utils/imageUploader";
import { ImageUploaderProps } from "../types";

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      imageFile,
      folderName,
    } = {
      imageFile: req?.file,
      firstName: req?.body?.firstName?.trim().toLowerCase(),
      lastName: req?.body?.lastName?.trim().toLowerCase(),
      email: req?.body?.email?.trim().toLowerCase(),
      password: req?.body?.password?.trim(),
      phoneNumber: req?.body?.phoneNumber?.trim(),
      folderName: req?.body?.folderName || "Profile_Pictures", // this is for storing profile images
    };

    const isEmailExists = await User.findOne({ email });

    if (isEmailExists) {
      throw new AppError("Email already exists", 400);
    }

    const isPhoneNumberExists = await User.findOne({ phoneNumber });

    if (isPhoneNumberExists) {
      throw new AppError("Phone number already exists", 400);
    }

    const imageResult =
      imageFile &&
      (await imageUploader({
        file: imageFile,
        folder: folderName,
      } as ImageUploaderProps));

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      profilePic: imageResult?.secure_url || "",
    });

    if (!user) {
      throw new AppError("Error creating user", 500);
    }

    const token = await generateToken(user._id, next);

    if (!token) {
      throw new AppError("Failed to generate token", 500);
    }

    SuccessResponse(res, 201, "User registered successfully", {
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in registerController", error);
    return CatchErrorResponse(error, next);
  }
};

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, phoneNumber } = {
      email: req?.body?.email?.trim().toLowerCase(),
      password: req?.body?.password?.trim(),
      phoneNumber: req?.body?.phoneNumber?.trim(),
    };

    let user = null;

    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isPasswordMatch) {
      throw new AppError("Wrong password", 400);
    }

    const token = await generateToken(user._id, next);

    if (!token) {
      throw new AppError("Error generating token", 500);
    }

    SuccessResponse(res, 200, "User logged in successfully", {
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
  } catch (error) {
    console.error("Error in loginController", error);
    return CatchErrorResponse(error, next);
  }
};

export { registerController, loginController };
