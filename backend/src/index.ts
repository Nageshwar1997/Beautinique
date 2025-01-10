import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import connectDB from "./configs/db.config";
import errorHandler from "./middlewares/errorHandler.middleware";
import notFoundHandler from "./middlewares/notFoundHandler.middleware";


const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON
app.use(express.json());

// Example route
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    error: false,
    message: "Welcome to the MERN Beauty Shop API",
  });
});

// Routes
// Auth routes
import authRouter from "./routes/auth.routes";
app.use("/api/auth", authRouter)

// Catch undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error: any) {
    console.log(`${error.message} - Server is not running`);
  }
});
