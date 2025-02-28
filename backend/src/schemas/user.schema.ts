import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: Schema.Types.String,
      unique: true,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      unique: true,
      trim: true,
    },
    profilePic: {
      type: Schema.Types.String,
      default: "",
      trim: true,
    },
    role: {
      type: Schema.Types.String,
      enum: ["USER", "SELLER", "ADMIN", "MASTER"],
      default: "MASTER",
    },

    password: {
      type: Schema.Types.String,
      trim: true,
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
    timestamps: true,
  }
);

export default userSchema;
