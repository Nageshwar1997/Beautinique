import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
    },
    lastName: {
      type: String,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["USER", "SELLER", "ADMIN", "MASTER"],
      default: "MASTER",
    },

    password: {
      type: String,
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
