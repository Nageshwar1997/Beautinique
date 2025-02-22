import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGODB_URI as string);
    console.log("Connected to the database");
  } catch (error: any) {
    console.error(`${error.message} - unable to connect to the database`);
    process.exit(1);
  }
};

export default connectDB;
