import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import generateToken from "../providers/jwt.provider";
import AppError from "../utils/AppError";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
} from "../validators/user.validator";
import SuccessResponse from "../middlewares/SuccessHandler.middleware";
import userServices from "../services/user.service";
import imageUploader from "../middlewares/imageUploader";
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

    if (!firstName) {
      return next(new AppError("First name is required", 400));
    } else if (firstName) {
      if (firstName.length < 2) {
        return next(
          new AppError("First name must be at least 2 characters long", 400)
        );
      } else if (firstName.length > 50) {
        return next(
          new AppError("First name must be at most 30 characters long", 400)
        );
      } else if (!isValidName(firstName)) {
        return next(new AppError("Please provide valid first name", 400));
      }
    }

    if (!lastName) {
      return next(new AppError("Last name is required", 400));
    } else if (lastName) {
      if (lastName.length < 2) {
        return next(
          new AppError("Last name must be at least 2 characters long", 400)
        );
      } else if (lastName.length > 50) {
        return next(
          new AppError("Last name must be at most 30 characters long", 400)
        );
      } else if (!isValidName(lastName)) {
        return next(new AppError("Please provide valid last name", 400));
      }
    }

    if (!phoneNumber) {
      return next(new AppError("Phone number is required", 400));
    } else if (phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber)) {
        return next(
          new AppError("Please provide a valid 10 digit phone number", 400)
        );
      }
      const isUnique = await userServices.findUserByValue({ phoneNumber });

      if (isUnique) {
        return next(new AppError("Phone number already exist", 400));
      }
    }

    if (!email) {
      return next(new AppError("Email is required", 400));
    } else if (email) {
      if (!isValidEmail(email)) {
        return next(new AppError("Please provide a valid email", 400));
      }

      const isUnique = await userServices.findUserByValue({ email });

      if (isUnique) {
        return next(new AppError("Email already exist", 400));
      }
    }

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

    const imageResult =
      imageFile &&
      (await imageUploader({
        file: imageFile,
        folder: folderName,
      } as ImageUploaderProps));

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await userServices.createUser({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      password: hashPassword,
      profilePic: imageResult?.secure_url ?? "",
    });

    if (!user) {
      return next(new AppError("Error registering user", 500));
    }

    const token = await generateToken(user._id, next);

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

    if (!email && !phoneNumber) {
      return next(new AppError("Email or phone number is required", 400));
    }

    if (!password) {
      return next(new AppError("Password is required", 400));
    }

    let user = null;

    if (email) {
      if (!isValidEmail(email)) {
        return next(new AppError("Please provide a valid email", 400));
      }

      user = await userServices.findUserByValue({ email });
    } else if (phoneNumber) {
      if (!isValidPhoneNumber(phoneNumber)) {
        return next(
          new AppError("Please provide a valid 10 digit phone number", 400)
        );
      }
      user = await userServices.findUserByValue({ phoneNumber });
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isPasswordMatch) {
      return next(new AppError("Wrong password", 400));
    }

    const token = await generateToken(user._id, next);
    if (!token) {
      return next(new AppError("Error generating token", 500));
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
  } catch (err: any) {
    return next(new AppError(err.message || "Error Logging user", 500));
  }
};

export { registerController, loginController };
