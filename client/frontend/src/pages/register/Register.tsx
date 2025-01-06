import { ChangeEvent, FC, useState } from "react";
import {
  CheckMark,
  InfoIcon,
  MailIcon,
} from "../../components/icons";

const Register = () => {
  // const initialData = {
  //   name: "",
  //   password: "",
  // };
  // const [formData, setFormData] = useState(initialData);

  // const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setFormData({ ...formData, [name]: value });

  //   console.log("formData", formData);
  // };

  // interface InputProps {
  //   label?: string;
  //   name?: string;
  //   type?: string;
  //   Icon?: FC;
  //   placeholder?: string;
  //   errorMessage?: string;
  //   successMessage?: string;
  // }

  const FloatingLabelInput: React.FC<InputProps> = ({
    label,
    name,
    type = "text",
    Icon,
    placeholder,
    errorMessage,
    successMessage,
  }) => {
    const [value, setValue] = useState("");

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    return (
      <div className="w-full space-y-1">
        <div className="relative">
          {/* Input */}
          <input
            type={type}
            id={name}
            name={name}
            placeholder=" " // Always keep placeholder blank to make space for the label
            value={value}
            onChange={handleInputChange}
            className="peer w-full h-12 px-5 text-primary-inverted bg-transparent border-2 border-gray-300 outline-none focus:border-blue-500"
          />

          {/* Label */}
          {label && (
            <label
              htmlFor={name}
              className={`absolute left-3 ${
                value
                  ? "top-0 text-sm text-blue-500"
                  : "top-1/2 text-base text-gray-500"
              } transform ${"-translate-y-1/2"} transition-all duration-200 peer-focus:top-0 peer-focus:text-sm peer-focus:border peer-focus:bg-white peer-focus:border-blue-500 peer-focus:text-blue-500 cursor-text`}
            >
              {label}
            </label>
          )}

          {/* Icon */}
          {Icon && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon />
            </span>
          )}
        </div>
        {errorMessage && !successMessage && (
          <span className="flex gap-1 items-center text-red-500 text-xs font-normal mt-2">
            <InfoIcon className="fill-red-500" />
            {errorMessage}
          </span>
        )}
        {successMessage && !errorMessage && (
          <span className="flex gap-1 items-center text-green-500 text-xs font-normal">
            <CheckMark className="fill-green-500" />
            {successMessage}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="w-screen h-screen overflow-hidden bg-[url(http://localhost:5173/public/images/auth_bg.jpg)] bg-cover bg-no-repeat bg-center relative">
        import React from "react";
        <div className="border border-[red] bg-[black]/50 backdrop-blur-[4px] max-w-xl w-full mx-auto absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg p-10">
          <form className="w-full h-full grid gap-2 border border-[red] space-y-1">
            <h1 className="text-center">Register</h1>
            {/* input-group */}
            {/* <div className="border h-12 border-black relative my-5">
              <input
                type="text"
                placeholder=" "
                className="w-full h-full text-[16px] text-white px-2.5 bg-transparent border border-[green] rounded-[5px]"
              />
              <label
                className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[16px] text-white
               px-1.5 pointer-events-none"
              >
                Name
              </label>
            </div> */}
            <FloatingLabelInput
              label="Name"
              type="text"
              Icon={MailIcon}
              name="name"
              // errorMessage="Testing"
              successMessage="Ok"
            />
            {/* <FloatingLabelInput
              label="Name"
              type="text"
              Icon={MailIcon}
              name="email"
              // errorMessage="Testing"
              successMessage="Ok"
            />
            <FloatingLabelInput
              label="Name"
              type="text"
              Icon={MailIcon}
              name="password"
              // errorMessage="Testing"
              successMessage="Ok"
            /> */}
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
