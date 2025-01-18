import { Router } from "express";
import registerController from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerController);

export default authRouter;
