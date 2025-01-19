import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage with Dynamic Folder Name
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log("file", file);
    console.log("Request Body:", req.body.folderName);
    console.log("Request Body:", req.body.fileName);
    const folderName = req.body.folderName /* || "Test_folder2";*/ // Retrieve folder name from request body or use a default
    const fileName = req.body.fileName /* || file.originalname; */ // Retrieve file name from request body or use the original name
    console.log("folderName", folderName);
    console.log("fileName", fileName);
    return {
      folder: folderName, // Dynamic folder name
      filename: fileName, // Dynamic file name
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Allowed formats
      resource_type: "image", // Specify resource type
    };
  },
});

const upload = multer({ storage });

export default upload;
