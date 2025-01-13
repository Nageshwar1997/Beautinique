import AuthRobot from "../components/AuthRobot";
import { useState } from "react";
import TextDisplay from "../../../components/TextDisplay";
import { RegisterTextContent } from "./constants";
import { EyeIcon } from "../../../components/icons";
import Input from "../../../components/Input";
import { useForm } from "react-hook-form";
import { AuthInputProps } from "../../../types";
import { registerInputMapData } from "../data";
import SocialAuth from "../components/SocialAuth";
import UploadProfile from "../components/UploadProfile";

const Register = () => {
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleIconClick = () => {};

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
            <UploadProfile />
            <TextDisplay
              content={RegisterTextContent}
              contentClassName="mt-5 font-semibold"
            />
          </div>
          {/* Social Login */}
          <SocialAuth />

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
