import { connect } from "mongoose"

const connectDB = async () => {
    try {
        await connect(process.env.MONGODB_URI as string);
        console.log("Connected to the database");
    } catch (error: any) {
        console.log(`${error.message} - unable to connect to the database`);
    }
}

export default connectDB;
