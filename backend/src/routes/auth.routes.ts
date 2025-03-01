import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controller";
import upload from "../configs/upload.multer.config";
import {
  loginUserValidationSchema,
  registerUserValidationSchema,
} from "../validations/user.validation";
import { validateSchema } from "../utils";

const authRouter = Router();

authRouter.post(
  "/register",
  upload.single("profilePic"),
  validateSchema(registerUserValidationSchema),
  registerController
);
authRouter.post(
  "/login",
  validateSchema(loginUserValidationSchema),
  loginController
);

export default authRouter;
