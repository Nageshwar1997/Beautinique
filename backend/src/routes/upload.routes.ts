import { NextFunction, Request, Response, Router } from "express";
import upload from "../configs/uploadProfilePic.config";
import handleImageUpload from "../middlewares/profilePicUpload.middleware";
import uploadProfilePicController from "../controllers/uploadImage.controller";

const uploadRouter = Router();

uploadRouter.post("/profile-pic", handleImageUpload, uploadProfilePicController);

export default uploadRouter;