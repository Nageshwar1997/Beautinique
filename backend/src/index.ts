import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import connectDB from "./configs/db.config";

const app = express();
const PORT = process.env.PORT || 5454;

// Routes
// Auth routes
import authRouter from "./routes/auth.routes";
import uploadRouter from "./routes/upload.routes";

// Error handling middleware
import NotFoundHandler from "./middlewares/notFoundHandler.middleware";
import ErrorHandler from "./middlewares/errorHandler.middleware";

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  process.env.FRONTEND_LOCAL_HOST_URL,
  process.env.FRONTEND_PRODUCTION_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins?.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Example route
app.get("/", (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    error: false,
    message: "Welcome to the MERN Beauty Shop API",
  });
});

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
    console.error(`${error.message} - Server is not running`);
  }
});
