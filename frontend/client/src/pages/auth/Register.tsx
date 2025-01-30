import { RefObject, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterTextContent, registerInputMapData } from "./constants";
import { VerticalScrollType, RegisterFormInputProps } from "../../types";
import AuthRobot from "./components/AuthRobot";
import UploadProfile from "./components/UploadProfile";
import TextDisplay from "../../components/TextDisplay";
import SocialAuth from "./components/SocialAuth";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { EyeIcon, EyeOffIcon } from "../../components/icons";
import PhoneInput from "../../components/input/PhoneInput";
import { Link } from "react-router-dom";
import Checkbox from "../../components/input/Checkbox";
import useVerticalScrollable from "../../hooks/useVerticalScrollable";
import { BottomGradient, TopGradient } from "../../components/Gradients";
import { registerSchema } from "./helpers";
import { useRegisterUser } from "../../api/user/user.service";
import Loading from "../../components/Loaders/Loading/Loading";

interface PasswordVisibilityType {
  password: boolean;
  confirmPassword: boolean;
}
const Register = () => {
  const [showGradient, containerRef] = useVerticalScrollable();
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<PasswordVisibilityType>({
    password: false,
    confirmPassword: false,
  });

  const userRegisterMutation = useRegisterUser();

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputProps>({
    resolver: yupResolver(registerSchema), // Use yup resolver for validation
  });

  const togglePasswordVisibility = (field: keyof PasswordVisibilityType) => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const onSubmit = async (data: RegisterFormInputProps) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (
        key === "profilePic" &&
        value instanceof FileList &&
        value.length > 0
      ) {
        const file = value[0];
        formData.append(key, file, file?.name);
        formData.append("folderName", "Profile_Pictures");
      } else {
        formData.append(
          key,
          typeof value === "boolean" ? value.toString() : value
        );
      }
    });

    console.log("data register", data);
    userRegisterMutation.mutate(formData);
  };

  // Watch the profilePic field
  const profilePicFile = watch("profilePic");

  // Generate preview when profilePic changes
  useEffect(() => {
    if (profilePicFile && profilePicFile[0]) {
      const file = profilePicFile[0];
      const url = URL.createObjectURL(file);
      setPreviewURL(url);

      // Cleanup URL object to avoid memory leaks
      return () => URL.revokeObjectURL(url);
    }
  }, [profilePicFile]);

  return (
    <div className="w-full min-h-dvh max-h-dvh h-full p-4 flex gap-4 overflow-hidden relative">
      <AuthRobot />
      {userRegisterMutation.isPending ? (
        <Loading content="Loading...." />
      ) : (
        <div
          ref={containerRef as RefObject<HTMLDivElement>}
          className={`w-full md:w-1/2 flex flex-col items-center gap-4 overflow-hidden overflow-y-scroll ${
            !(showGradient as VerticalScrollType).bottom &&
            !(showGradient as VerticalScrollType).top
              ? "justify-center"
              : "justify-start"
          }`}
        >
          {(showGradient as VerticalScrollType).top && <TopGradient />}
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="w-full flex flex-col gap-4"
          >
            <div className="text-center mb-3">
              <TextDisplay
                content={RegisterTextContent}
                contentClassName="mb-3 font-semibold"
              />
              <UploadProfile
                imageUrl={previewURL}
                register={{
                  ...register("profilePic" as keyof RegisterFormInputProps),
                }}
                name="profilePic"
              />
            </div>
            <SocialAuth />
            <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
              <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-5 lg:gap-y-6">
                  {registerInputMapData?.map((field, index) => {
                    const { label, name, type, placeholder } = field;
                    return (
                      <div
                        key={index}
                        className={`${
                          ![
                            "firstName",
                            "lastName",
                            "password",
                            "confirmPassword",
                          ].includes(name) && "lg:col-span-2"
                        }`}
                      >
                        {name === "phoneNumber" ? (
                          <PhoneInput
                            label={label}
                            type={type}
                            placeholder={placeholder}
                            name={name}
                            register={{ ...register(name) }}
                            errorText={errors[name]?.message}
                          />
                        ) : (
                          <Input
                            type={
                              ["password", "confirmPassword"].includes(name)
                                ? showPasswords[
                                    name as keyof PasswordVisibilityType
                                  ]
                                  ? "text"
                                  : type
                                : type
                            }
                            label={label}
                            placeholder={placeholder}
                            name={name}
                            register={{ ...register(name) }}
                            errorText={errors[name]?.message}
                            icon={
                              ["password", "confirmPassword"].includes(name) &&
                              (showPasswords[
                                name as keyof PasswordVisibilityType
                              ] ? (
                                <EyeOffIcon />
                              ) : (
                                <EyeIcon />
                              ))
                            }
                            iconClick={() =>
                              togglePasswordVisibility(
                                name as keyof PasswordVisibilityType
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox register={{ ...register("remember") }} />
                      <span className="text-sm text-primary-inverted-50 font-medium">
                        Remember me
                      </span>
                    </div>
                    <Link
                      to="/"
                      className="bg-clip-text text-transparent bg-silver-duo-gradient hover:bg-accent-duo"
                    >
                      Back
                    </Link>
                  </div>
                  <Button
                    pattern="primary"
                    type="submit"
                    content="Register"
                    className="!text-base"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <p className="bg-clip-text text-transparent bg-silver-duo-gradient text-xs md:text-sm">
                      Already have an account?
                    </p>
                    <Link
                      to={"/login"}
                      className={`bg-clip-text text-transparent bg-accent-duo hover:font-extrabold text-sm md:text-base`}
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
          {(showGradient as VerticalScrollType).bottom && <BottomGradient />}
        </div>
      )}
    </div>
  );
};

export default Register;
