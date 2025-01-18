import { ChangeEvent, FormEvent, RefObject, useState } from "react";
import {
  getPasswordFieldType,
  initialRegisterData,
  registerInputMapData,
  RegisterTextContent,
  validateRegisterForm,
} from "../constants";
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
import { PasswordVisibilityTypes } from "../../../types";
import { EyeIcon, EyeOffIcon } from "../../../components/icons";
import useIsScrollable from "../../../hooks/useIsScrollable";
import PhoneInput from "../../../components/input/PhoneInput";
import { Link } from "react-router-dom";
import Checkbox from "../../../components/input/Checkbox";

const Register = () => {
  const [scrollRef, isScrollable] = useIsScrollable();

  const [data, setData] = useState(initialRegisterData);
  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordVisibilityTypes>({
      password: false,
      confirmPassword: false,
    });

  type ErrorsType = {
    [key: string]: string;
  };

  const [errors, setErrors] = useState<ErrorsType>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = (type: keyof PasswordVisibilityTypes) => {
    setPasswordVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if ((name === "firstName" || name === "lastName") && validateName(value)) {
      setData((prevData) => ({ ...prevData, [name]: value }));
    } else if (name === "email" && validateEmail(value)) {
      setData((prevData) => ({ ...prevData, [name]: value }));
    } else if (
      (name === "password" || name === "confirmPassword") &&
      validatePassword(value)
    ) {
      setData((prevData) => ({ ...prevData, [name]: value }));
    } else if (name === "phoneNumber") {
      const newValue = validateNumber(value);
      setData((prevData) => ({ ...prevData, [name]: newValue }));
    } else if (type === "checkbox" && name === "remember") {
      setData((prevData) => ({ ...prevData, [name]: checked }));
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedErrors = validateRegisterForm(data);

    if (Object.values(updatedErrors).some((error) => error !== "")) {
      setErrors(updatedErrors);
      return;
    }
    console.log("data", data);
  };

  return (
    <div className="w-full min-h-dvh max-h-dvh h-full p-4 flex gap-4 overflow-hidden">
      <AuthRobot />
      <div
        ref={scrollRef as RefObject<HTMLDivElement>}
        className={`w-full md:w-1/2 flex flex-col items-center gap-4 overflow-hidden overflow-y-scroll ${
          isScrollable ? "justify-start" : "justify-center"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full flex flex-col gap-4"
        >
          <div className="text-center mb-3">
            <TextDisplay
              content={RegisterTextContent}
              contentClassName="mb-3 font-semibold"
            />
            <UploadProfile />
          </div>
          <SocialAuth />
          <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-5 lg:gap-y-6">
                {registerInputMapData?.map((item, ind) => {
                  return (
                    <div
                      key={ind}
                      className={`${
                        ![
                          "firstName",
                          "lastName",
                          "password",
                          "confirmPassword",
                        ].includes(item?.name) && "lg:col-span-2"
                      }`}
                    >
                      {item.name === "phoneNumber" ? (
                        <PhoneInput
                          autoComplete={item?.autoComplete}
                          label={item?.label}
                          type={item?.type}
                          placeholder={item?.placeholder}
                          name={item?.name}
                          value={data[item?.name] as string}
                          onChange={handleInputChange}
                          errorText={errors[item?.name]}
                        />
                      ) : (
                        <Input
                          autoComplete={item?.autoComplete}
                          label={item?.label}
                          type={getPasswordFieldType(
                            item?.name as keyof PasswordVisibilityTypes,
                            passwordVisibility
                          )}
                          placeholder={item?.placeholder}
                          name={item?.name}
                          value={data[item?.name] as string}
                          onChange={handleInputChange}
                          icon={
                            item?.icon &&
                            ["password", "confirmPassword"].includes(
                              item?.name
                            ) &&
                            (passwordVisibility[
                              item?.name as keyof PasswordVisibilityTypes
                            ] ? (
                              <EyeOffIcon className="fill-primary-inverted-50 hover:fill-primary-inverted" />
                            ) : (
                              <EyeIcon className="fill-primary-inverted-50 hover:fill-primary-inverted" />
                            ))
                          }
                          iconClick={() =>
                            ["password", "confirmPassword"].includes(
                              item?.name
                            ) &&
                            togglePasswordVisibility(
                              item?.name as keyof PasswordVisibilityTypes
                            )
                          }
                          errorText={errors[item?.name]}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={data?.remember as boolean}
                    onChange={handleInputChange as () => void}
                  />
                  <span className="text-sm text-primary-inverted-50 font-medium">
                    Remember me
                  </span>
                </div>
                <Button
                  pattern="primary"
                  type="submit"
                  content="Register"
                  className="!text-base"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <p className="bg-clip-text text-transparent bg-silver-duo-gradient">
                  Already have an account?
                </p>
                <Link
                  to={"/login"}
                  className={`bg-clip-text text-transparent bg-accent-duo`}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
