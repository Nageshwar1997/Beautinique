import AuthRobot from "../components/AuthRobot";

import TextDisplay from "../../../components/TextDisplay";
import { RegisterTextContent } from "./constants";
import { CameraIcon } from "../../../components/icons";

const Register = () => {
  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-4 border border-[red]">
        <div className="w-full">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full relative shadow-2xl shadow-[blue] overflow-hidden group cursor-pointer">
              <label
                htmlFor="profilePic"
                className="absolute inset-0 bg-gradient-to-br from-primary via-transparent to-gray-400 rounded-full blur-sm animate-pulse cursor-pointer"
              />
              <img
                src="https://ctruhcdn.azureedge.net/main-webiste/public/images/products/individuals/ctruh-platfrom/categories/character/image10.webp"
                alt="Profile Picture"
                className="object-cover bg-accent-duo rounded-full w-full h-full shadow-inner border-2 border-smoke-eerie"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-smoke-eerie flex items-center justify-center">
                <CameraIcon className="fill-primary-inverted opacity-70 group-hover:opacity-100" />
                <input
                  id="profilePic"
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
            <TextDisplay
              content={RegisterTextContent}
              contentClassName="!font-[700] mt-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
