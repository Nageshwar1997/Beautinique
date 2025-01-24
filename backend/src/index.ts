import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./configs/db.config";

const app = express();
const PORT = process.env.PORT || 5454;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Example route
app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    error: false,
    message: "Welcome to the MERN Beauty Shop API",
  });
});

// Routes
// Auth routes
import authRouter from "./routes/auth.routes";
import uploadRouter from "./routes/upload.routes";
import NotFoundHandler from "./middlewares/NotFoundHandler.middleware";
import ErrorHandler from "./middlewares/ErrorHandler.middleware";

app.use("/api/auth", authRouter);

app.use("/api/upload", uploadRouter);

// Catch undefined routes
app.use(NotFoundHandler);

// Error handling middleware
app.use(ErrorHandler);

// Start the server
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error: any) {
    console.log(`${error.message} - Server is not running`);
  }
});
