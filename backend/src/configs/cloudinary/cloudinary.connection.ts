import cloudinary from "./cloudinary.config";

const testCloudinaryConnection = async () => {
  try {
    const res = await cloudinary.api.ping();
    // console.log("Cloudinary Connected ✅", res);
    return {
      success: true,
      error: false,
      message: "Cloudinary Connected ✅",
      data: res,
    };
  } catch (err: any) {
    // console.error("Cloudinary Connection Error ❌", err.message);
    return {
      success: false,
      error: true,
      message: "Cloudinary Connection Error ❌",
      data: err.message,
    };
  }
};

export default testCloudinaryConnection;
