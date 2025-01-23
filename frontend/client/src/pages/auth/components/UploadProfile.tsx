import { useLocation } from "react-router-dom";
import { CameraIcon } from "../../../components/icons";
import { ChangeEvent } from "react";

const UploadProfile = ({
  imageUrl,
  onChange,
  name = "image",
}: {
  imageUrl?: string | null;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { pathname } = useLocation();
  return (
    <div className="w-20 h-20 mx-auto rounded-full relative shadow-2xl shadow-[blue] overflow-hidden group cursor-pointer">
      <label
        htmlFor={name}
        className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-gray-400 rounded-full blur-sm animate-pulse cursor-pointer"
      />
      <img
        src={
          imageUrl ||
          "https://ctruhcdn.azureedge.net/main-webiste/public/images/products/individuals/ctruh-platfrom/categories/character/image10.webp"
        }
        alt="Profile Picture"
        className="object-cover bg-accent-duo rounded-full w-full h-full shadow-inner border-2 border-smoke-eerie"
        // loading="lazy"
      />
      {pathname === "/register" && (
        <div className="absolute bottom-0 left-0 right-0 bg-smoke-eerie flex items-center justify-center">
          <CameraIcon className="fill-primary-inverted opacity-70 group-hover:opacity-100" />
          <input
            id={name}
            name={name}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
};

export default UploadProfile;
