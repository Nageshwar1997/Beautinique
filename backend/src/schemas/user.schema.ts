import { Schema } from "mongoose";
import {
  hasLowercase,
  hasNumber,
  hasSymbol,
  hasUppercase,
  hasValidLength,
  isEmailUnique,
  isPhoneNumberUnique,
  isValidEmail,
  isValidName,
  isValidPhoneNumber,
} from "../validators/user.validator";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      minlength: [2, "First Name must be at least 2 characters long"],
      maxlength: [30, "First Name must be at most 30 characters long"],
      lowercase: true,
      validate: {
        validator: isValidName,
        message: "Please provide valid first name",
      },
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      minlength: [2, "Last Name must be at least 2 characters long"],
      maxlength: [30, "Last Name must be at most 30 characters long"],
      lowercase: true,
      validate: {
        validator: isValidName,
        message: "Please provide valid last name",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number is required"],
      unique: true,
      minlength: [10, "Phone Number must be at least 10 characters long"],
      validate: [
        {
          validator: isValidPhoneNumber,
          message: "Please provide a valid phone number",
        },
        {
          validator: isPhoneNumberUnique,
          message: "Phone number already exist",
        },
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: [
        {
          validator: isEmailUnique,
          message: "Email already exist",
        },
        {
          validator: isValidEmail,
          message: "Please provide a valid email",
        },
      ],
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["USER", "SELLER", "ADMIN", "MASTER"],
      default: "USER",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      validate: [
        {
          validator: hasSymbol,
          message: "Password must contain at least one special character",
        },
        {
          validator: hasUppercase,
          message: "Password must contain at least one uppercase letter",
        },
        {
          validator: hasLowercase,
          message: "Password must contain at least one lowercase letter",
        },
        {
          validator: hasNumber,
          message: "Password must contain at least one number",
        },
        {
          validator: hasValidLength,
          message: "Password must be at least 6 characters long",
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    // addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    // cart: [{ type: Schema.Types.ObjectId, ref: "Cart" }],
    // wishlist: [{ type: Schema.Types.ObjectId, ref: "Wishlist" }],
    // orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    // reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    // ratings: [{ type: Schema.Types.ObjectId, ref: "Rating" }],
    // payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  {
    versionKey: false,
  }
);

export default userSchema;
