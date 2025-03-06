// getUserById;
import { Router } from "express";
import { getUserById } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUserById);

export default userRouter;
