import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_, file) => {
    // _ is the request object, file is the uploaded file

    const folderName = "Profile Pics";
    const fileName = file?.originalname;
    const publicId = `${fileName
      .split(".")
      .slice(0, -1)
      .join("")}-${Date.now().toString()}`;
    return {
      folder: folderName, // Dynamic folder name
      filename: fileName, // Dynamic file name
      public_id: publicId,
      resource_type: "image", // Specify resource type
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Allowed formats
    };
  },
});

const upload = multer({ storage });

export default upload;
