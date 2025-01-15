import { ChangeEvent, FormEvent, useState } from "react";
import { initialRegisterData, RegisterTextContent } from "./constants";
import {
  validateEmail,
  validateName,
  validateNumber,
  validatePassword,
} from "../../../validators";
import AuthRobot from "../components/AuthRobot";
import UploadProfile from "../components/UploadProfile";
import TextDisplay from "../../../components/TextDisplay";
import SocialAuth from "../components/SocialAuth";
import Input from "../../../components/input/Input";
import Button from "../../../components/button/Button";
import { AuthInputProps, PasswordVisibilityTypes } from "../../../types";
import { EyeIcon, EyeOffIcon } from "../../../components/icons";

const Register = () => {
  const [data, setData] = useState(initialRegisterData);
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (type: keyof PasswordVisibilityTypes) => {
    setPasswordVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      if (validateName(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "email") {
      if (validateEmail(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "password" || name === "confirmPassword") {
      if (validatePassword(value)) {
        setData((prevData) => ({ ...prevData, [name]: value }));
      }
    } else if (name === "phoneNumber") {
      const newValue = validateNumber(value);
      setData((prevData) => ({ ...prevData, [name]: newValue }));
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  console.log("Data", data);

  const inputMapData: {
    name: keyof AuthInputProps;
    label: string;
    type: string;
    autoComplete: string;
    icon?: boolean;
  }[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      autoComplete: "given-name",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      autoComplete: "given-name",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      autoComplete: "email",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
      autoComplete: "tel",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      icon: true,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      autoComplete: "new-password",
      icon: true,
    },
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Data Submit", data);
  };

  console.log("passwordVisibility", passwordVisibility);

  return (
    <div className="w-full min-h-dvh p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center gap-4 overflow-hidden">
        <form
          onSubmit={handleSubmit}
          // aria-autocomplete="none"
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
          <SocialAuth />
          <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-5 lg:gap-y-6">
                {inputMapData.map((item, ind) => {
                  return (
                    <div
                      key={ind}
                      className={`${
                        ![
                          "firstName",
                          "lastName",
                          "password",
                          "confirmPassword",
                        ].includes(item.name) && "lg:col-span-2"
                      }`}
                    >
                      <Input
                        autoComplete={item.autoComplete}
                        label={item.label}
                        type={item.type}
                        name={item.name}
                        value={data[item.name]}
                        onChange={handleInputChange}
                        icon={
                          item?.icon &&
                          ["password", "confirmPassword"].includes(item.name) &&
                          (passwordVisibility[
                            item.name as "password" | "confirmPassword"
                          ] ? (
                            <EyeOffIcon />
                          ) : (
                            <EyeIcon />
                          ))
                        }
                        iconClick={() => {
                          if (
                            ["password", "confirmPassword"].includes(item.name)
                          ) {
                            togglePasswordVisibility(
                              item?.name as keyof PasswordVisibilityTypes
                            );
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <Button pattern="primary" type="submit" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
