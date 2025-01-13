import AuthRobot from "../components/AuthRobot";
import { ChangeEvent, FormEvent, useState } from "react";
import TextDisplay from "../../../components/TextDisplay";
import { initialRegisterData, RegisterTextContent } from "./constants";
import { EyeIcon, EyeOffIcon } from "../../../components/icons";
import Input from "../../../components/Input";
import { AuthInputProps } from "../../../types";
import { registerInputMapData } from "../data";
import SocialAuth from "../components/SocialAuth";
import UploadProfile from "../components/UploadProfile";

const Register = () => {
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [data, setData] = useState<AuthInputProps>(initialRegisterData || {});

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

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
              onSubmit={handleSubmit}
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
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        console.log(e);
                      }}
                      errorText={""}
                      icon={
                        ["password", "confirmPassword"].includes(
                          input?.field
                        ) &&
                        (showPassword[
                          input?.field as keyof typeof showPassword
                        ] ? (
                          <EyeOffIcon
                            className="cursor-pointer"
                            onClick={() =>
                              togglePasswordVisibility(
                                input?.field as keyof typeof showPassword
                              )
                            }
                          />
                        ) : (
                          <EyeIcon
                            className="cursor-pointer"
                            onClick={() =>
                              togglePasswordVisibility(
                                input?.field as keyof typeof showPassword
                              )
                            }
                          />
                        ))
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
