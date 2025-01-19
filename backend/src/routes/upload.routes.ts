import { Request, Response, Router } from "express";
import upload from "../middlewares/uploadFile.middleware";

const uploadRouter = Router();

uploadRouter.post("/profile-pic", upload.single("profilePic"), (req:Request, res:Response) => {
    try {
        const profilePicUrl = req.file?.path; // URL of the uploaded image

        console.log("Request Body from route:", req.body); // Log the body
        console.log("Uploaded File from route:", req.file); // Log file info
        res.status(200).json({ success: true, url: profilePicUrl,test:req.body });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default uploadRouter;