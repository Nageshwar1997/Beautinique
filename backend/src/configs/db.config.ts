import mongoose from "mongoose"

const mongoDB_String = "mongodb+srv://nageshpawarpatil:nageshpawarpatil@mern-beauty-shop.5q4f2.mongodb.net/test?retryWrites=true&w=majority&appName=MERN-Beauty-Shop"

const connectDB = async () => {
    try {
        await mongoose.connect(mongoDB_String);
        console.log("Connected to the database");
    } catch (error: any) {
        console.log(`${error.message} - unable to connect to the database`);
    }
}

export default connectDB