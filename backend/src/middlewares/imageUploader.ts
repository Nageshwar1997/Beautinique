import cloudinary from "../configs/uploadProfilePic.config";
import AppError from "../utils/AppError";

// Function to handle profile picture upload to Cloudinary
const imageUploader = async (file: Express.Multer.File, folder?: string) => {
  return new Promise<object>((resolve, reject) => {
    if (!file) {
      return reject(new AppError("No file provided for upload", 400));
    }

    const mainFolder = "Beauty_Shop";
    const subFolder = folder || "Testing_route";

    cloudinary.uploader
      .upload_stream(
        {
          folder: `${mainFolder}/${subFolder}`,
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                error.message || "Failed to upload image on cloudinary",
                500
              )
            );
          } else if (result) {
            return resolve(result); // Returning the result that includes whole result object
          }
        }
      )
      .end(file?.buffer); // Upload the file buffer to Cloudinary
  });
};

export default imageUploader;
