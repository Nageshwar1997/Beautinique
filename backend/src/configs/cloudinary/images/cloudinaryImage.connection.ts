import cloudinaryImage from "./cloudinaryImage.config";

const testCloudinaryImageConnection = async () => {
  try {
    const res = await cloudinaryImage.api.ping();
    console.log("Cloudinary Image Connected ✅", res);
    return {
      success: true,
      error: false,
      message: "Cloudinary Image Connected ✅",
      data: res,
    };
  } catch (err: any) {
    console.error("Cloudinary Image Connection Error ❌", err.message);
    return {
      success: false,
      error: true,
      message: "Cloudinary Image Connection Error ❌",
      data: err.message,
    };
  }
};

export default testCloudinaryImageConnection;
