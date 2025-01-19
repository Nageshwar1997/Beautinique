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
    const folderName = "Profile Pics";
    const fileName = file.originalname;
    let x = await req.body;

    console.log("x",x)
    return {
      folder: folderName, // Dynamic folder name
      filename: fileName, // Dynamic file name
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // Allowed formats
      resource_type: "image", // Specify resource type
      public_id: `${fileName.split('.').slice(0, -1).join('')}${Date.now().toString()}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
