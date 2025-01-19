import { Router } from "express";
import registerController from "../controllers/auth.controller";
import validateMongooseSchema from "../middlewares/validateSchema.middleware";
import User from "../models";

const authRouter = Router();

authRouter.post("/register", validateMongooseSchema(User), registerController);

export default authRouter;
