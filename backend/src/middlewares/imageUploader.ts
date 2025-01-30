import cloudinary from "../configs/cloudinary/cloudinary.config";
import testCloudinaryConnection from "../configs/cloudinary/cloudinary.connection";
import { ImageUploaderProps, UploadImageResult } from "../types";
import AppError from "../utils/AppError";

// Function to handle profile picture upload to Cloudinary
const imageUploader = async ({
  file,
  folder,
}: ImageUploaderProps): Promise<UploadImageResult> => {
  if (!file) {
    throw new AppError("No file provided for upload", 400);
  }

  const mainFolder = "Beauty_Shop";
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
    console.error(
      "cloudinaryConnectionResult",
      cloudinaryConnectionResult.data
    );
    throw new AppError(cloudinaryConnectionResult.message, 500);
  } else {
    console.log("cloudinaryConnectionResult", cloudinaryConnectionResult.data);
  }

  try {
    const result: UploadImageResult = await new Promise((resolve, reject) => {
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
            resolve(result as UploadImageResult); // Cast result to UploadResult
          }
        )
        .end(file?.buffer); // Upload the file buffer to Cloudinary
    });

    return result; // Return the result object
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Unexpected error during upload",
      500
    );
  }
};

export default imageUploader;
