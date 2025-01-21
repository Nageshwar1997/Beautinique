import { ChangeEvent, useState } from "react";
import { CameraIcon } from "../../components/icons";
import axios from "axios";

const Home = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setImageUrl(null);
    const file = e.target.files?.[0];

    if (!file) {
      alert("Please select a file");
      return;
    }

    if (file) {
      // Set image preview
      const preview = URL.createObjectURL(file);
      setImageUrl(preview);

      // Upload image to backend
      try {
        const formData = new FormData();
        formData.append("profilePic", file);

        const folderName = "Profile Pics"; // You can hardcode any folder name here between two quotes use space or hyphen or underscore
        formData.append("folder", folderName);

        const response = await axios.post(
          "http://localhost:8080/api/upload/profile-pic", // Replace with your backend URL
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const responseData = response?.data;

        // Update the profile picture URL (you can save this to state or context)
        if (responseData?.success) {
          setImageUrl(responseData?.url);

        }
      } catch (error) {
        setImageUrl(null);
        console.error("Error uploading image:", error);
      }
    }
  };

  return (
    <div className="w-20 h-20 mx-auto rounded-full relative shadow-2xl shadow-[blue] overflow-hidden group cursor-pointer">
      <label
        htmlFor="profilePic"
        className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-gray-400 rounded-full blur-sm animate-pulse cursor-pointer"
      />
      <img
        src={
          imageUrl ||
          "https://ctruhcdn.azureedge.net/main-webiste/public/images/products/individuals/ctruh-platfrom/categories/character/image10.webp"
        }
        alt="Profile Picture"
        className="object-cover bg-accent-duo rounded-full w-full h-full shadow-inner border-2 border-smoke-eerie"
        loading="lazy"
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
    </div>
  );
};

export default Home;
