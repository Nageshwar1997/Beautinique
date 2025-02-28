import cloudinaryVideo from "./cloudinaryVideo.config";

const testCloudinaryVideoConnection = async () => {
  try {
    const res = await cloudinaryVideo.api.ping();
    console.log("Cloudinary Video Connected ✅", res);
    return {
      success: true,
      error: false,
      message: "Cloudinary Video Connected ✅",
      data: res,
    };
  } catch (err: any) {
    console.error("Cloudinary Video Connection Error ❌", err.message);
    return {
      success: false,
      error: true,
      message: "Cloudinary Video Connection Error ❌",
      data: err.message,
    };
  }
};

export default testCloudinaryVideoConnection;
