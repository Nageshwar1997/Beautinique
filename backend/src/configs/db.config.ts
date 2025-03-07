import { connect } from "mongoose";
import { AppError } from "../constructors";

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }
  try {
    await connect(process.env.MONGODB_URI as string);
    console.log("Connected to the database");
  } catch (error: any) {
    throw new Error(`${error.message} - unable to connect to the database`);
  }
};

export default connectDB;
