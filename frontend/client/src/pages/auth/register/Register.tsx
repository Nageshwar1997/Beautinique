/* eslint-disable react-hooks/exhaustive-deps */
import AuthRobot from "../components/AuthRobot";
import { ChangeEvent, FormEvent, useState } from "react";
import TextDisplay from "../../../components/TextDisplay";
import { initialRegisterData, RegisterTextContent } from "./constants";
// import { EyeIcon, EyeOffIcon } from "../../../components/icons";

// import { AuthInputProps } from "../../../types";
import { registerInputMapData } from "../data";
import SocialAuth from "../components/SocialAuth";
import UploadProfile from "../components/UploadProfile";
import Input from "../../../components/Input";
// import { EyeIcon, EyeOffIcon } from "../../../components/icons";

const Register = () => {
  // const [showPassword, setShowPassword] = useState({
  //   password: false,
  //   confirmPassword: false,
  // });

  const [data, setData] = useState(initialRegisterData || {});

  // const togglePasswordVisibility = (field: keyof typeof showPassword) => {
  //   setShowPassword((prevState) => ({
  //     ...prevState,
  //     [field]: !prevState[field],
  //   }));
  // };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  console.log("data change", data);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Data Submit", data);
  };

  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-4 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full flex flex-col gap-4 overflow-hidden overflow-y-scroll"
        >
          <div className="text-center mb-3">
            <UploadProfile />
            <TextDisplay
              content={RegisterTextContent}
              contentClassName="mt-3 font-semibold"
            />
          </div>
          {/* Social Login */}
          <SocialAuth />

          <div className="w-full sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-5 lg:gap-y-6">
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
                      onChange={handleInputChange}
                      type={input?.type}
                      errorText="Hello"
                    />
                  </div>
                ))}
              </div>
              <button type="submit" className="text-white">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
