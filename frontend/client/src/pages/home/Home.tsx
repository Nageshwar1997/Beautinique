import { useState } from "react";
import { CameraIcon } from "../../components/icons";
import axios from "axios";

const Home = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Set image preview
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload image to backend
      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("profilePic", file);
        formData.append("folderName", "profile_pics"); // Specify folder name
        formData.append("fileName", "TestFileName"); // Specify file name

        const response = await axios.post(
          "http://localhost:8080/api/upload/profile-pic", // Replace with your backend URL
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("response", response);

        // const { imageUrl } = response.data;
        // console.log("Uploaded Image URL:", imageUrl);

        // Update the profile picture URL (you can save this to state or context)
        // setPreviewUrl(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  console.log("previewUrl", previewUrl);
  console.log("selectedImage", selectedImage);
  return (
    <div className="w-20 h-20 mx-auto rounded-full relative shadow-2xl shadow-[blue] overflow-hidden group cursor-pointer">
      <label
        htmlFor="profilePic"
        className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-gray-400 rounded-full blur-sm animate-pulse cursor-pointer"
      />
      <img
        src={
          previewUrl ||
          "https://ctruhcdn.azureedge.net/main-webiste/public/images/products/individuals/ctruh-platfrom/categories/character/image10.webp"
        }
        alt="Profile Picture"
        className="object-cover bg-accent-duo rounded-full w-full h-full shadow-inner border-2 border-smoke-eerie"
        // loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-smoke-eerie flex items-center justify-center">
        <CameraIcon className="fill-primary-inverted opacity-70 group-hover:opacity-100" />
        <input
          id="profilePic"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      {uploading && <p className="text-sm text-primary">Uploading...</p>}
    </div>
  );
};

export default Home;
