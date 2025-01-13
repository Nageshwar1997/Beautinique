import AuthRobot from "../components/AuthRobot";

import TextDisplay from "../../../components/TextDisplay";
import { RegisterTextContent } from "./constants";
import { CameraIcon, EyeIcon } from "../../../components/icons";
import Input from "../../../components/Input";
import { useForm } from "react-hook-form";
import { AuthInputProps } from "../../../types";
import { registerInputMapData } from "../data";

const socialMediaAccounts = [
  {
    name: "Google",
    url: "https://ctruhcdn.azureedge.net/public/images/login/google.webp",
  },
  {
    name: "Facebook",
    url: "https://ctruhcdn.azureedge.net/public/images/login/facebook.webp",
  },
  {
    name: "Github",
    url: "https://ctruhcdn.azureedge.net/public/images/login/github_logo.webp",
  },
  {
    name: "Linkedin",
    url: "https://ctruhcdn.azureedge.net/public/images/login/linkedin.webp",
  },
];

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthInputProps>();
  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-start 2xl:justify-center gap-4 overflow-hidden">
        <form className="w-full flex flex-col gap-4 overflow-hidden overflow-y-scroll">
          <div className="text-center mb-3">
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
              contentClassName="mt-5 font-semibold"
            />
          </div>
          {/* Social Login */}
          <div className="flex items-center justify-center gap-4">
            {socialMediaAccounts.map((item, index) => (
              <div
                key={index}
                className="h-12 w-12 p-2.5 rounded-2xl border border-primary-inverted-14 bg-seasalt-black backdrop-blur mb-2.5 cursor-pointer shadow-neumorphic"
              >
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full p-0.5 object-cover"
                  title={item.name}
                />
              </div>
            ))}
          </div>

          <div className="w-full sm:w-[90%] md:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <form
              className="shadow-shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6"
              onSubmit={handleSubmit((data) => console.log(data))}
              autoComplete="off"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">
                {registerInputMapData?.map((input) => (
                  <div
                    key={input?.field}
                    className={`${
                      ![
                        "firstName",
                        "lastName",
                        "password",
                        "confirmPassword",
                      ].includes(input.field)
                        ? "lg:col-span-2"
                        : ""
                    }`}
                  >
                    <Input
                      label={input?.placeholder}
                      name={input?.field}
                      icon={
                        (input?.field === "password" ||
                          input?.field === "confirmPassword") && (
                          <EyeIcon className="fill-platinum-black-inverted" />
                        )
                      }
                      register={register(
                        input?.field as keyof AuthInputProps,
                        input?.register
                      )}
                      errorText={
                        (errors[input?.field as keyof AuthInputProps]
                          ?.message as string) || ""
                      }
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="text-white">
                Submit
              </button>
              {/* <Button
      type="solid"
      content="Send Enquiry"
      className="w-full outline-none"
      submit
    /> */}
            </form>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
