import cloudinary from "../configs/cloudinary/images/cloudinaryImage.config";
import testCloudinaryConnection from "../configs/cloudinary/images/cloudinaryImage.connection";
import { AppError } from "../constructors";
import { CloudinaryImageUploadResultType, ImageUploaderProps } from "../types";

// Function to handle profile picture upload to Cloudinary
const imageUploader = async ({
  file,
  folder,
}: ImageUploaderProps): Promise<CloudinaryImageUploadResultType> => {
  if (!file) {
    throw new AppError("No file provided for upload", 400);
  }

  const mainFolder = process.env.CLOUDINARY_MAIN_FOLDER;
  const subFolder = folder?.split(" ").join("_") || "Common_Folder";

  const publicId = `${Date.now().toString()}_${file?.originalname
    .split(" ")
    .join("_")
    .split(".")
    .slice(0, -1)
    .join("")}`;

  // Cloudinary Connectivity Test
  const cloudinaryConnectionResult = await testCloudinaryConnection();

  if (cloudinaryConnectionResult.error) {
    throw new AppError(cloudinaryConnectionResult.message, 500);
  }

  try {
    const result: CloudinaryImageUploadResultType = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `${mainFolder}/${subFolder}`,
              public_id: publicId,
              resource_type: "image",
              allowed_formats: ["jpg", "jpeg", "png", "webp"],
            },
            (error, result) => {
              if (error) {
                return reject(
                  new AppError(
                    error.message || "Failed to upload image on Cloudinary",
                    500
                  )
                );
              }
              resolve(result as CloudinaryImageUploadResultType); // Cast result to UploadResult
            }
          )
          .end(file?.buffer); // Upload the file buffer to Cloudinary
      }
    );

    return result; // Return the result object
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during upload",
      500
    );
  }
};

export default imageUploader;
