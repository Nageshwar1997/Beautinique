import { useLocation } from "react-router-dom";
import { CameraIcon } from "../../../icons";
import { FileInputProps } from "../../../types";

const UploadProfile = ({
  imageUrl,
  register,
  name = "image",
  className,
}: FileInputProps) => {
  const { pathname } = useLocation();
  return (
    <div
      className={`w-20 h-20 mx-auto rounded-full shadow-primary-btn-hover overflow-hidden group ${className}`}
    >
      <label htmlFor={name} className="relative cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-inverted via-transparent to-gray-400 rounded-full blur-sm animate-pulse cursor-pointer" />
        <img
          src={
            imageUrl ||
            "https://ctruhcdn.azureedge.net/main-webiste/public/images/products/individuals/ctruh-platfrom/categories/character/image10.webp"
          }
          alt="Profile Picture"
          className="object-cover bg-accent-duo rounded-full w-full h-full shadow-inner"
          loading="lazy"
        />
        {pathname === "/register" && (
          <div className="absolute bottom-0 left-0 right-0 bg-smoke-eerie flex items-center justify-center">
            <CameraIcon className="fill-primary opacity-70 group-hover:opacity-100" />
            <input
              id={name}
              name={name}
              type="file"
              className="hidden"
              accept="image/*"
              {...register}
            />
          </div>
        )}
      </label>
    </div>
  );
};

export default UploadProfile;
