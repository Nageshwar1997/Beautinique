import { RefObject, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterTextContent } from "./constants";
import { VerticalScrollType } from "../../types";
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
import { useMutation } from "@tanstack/react-query";
import api from "../../configs/axios.instance.config";

export interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic?: FileList; // Correctly type the file input
  remember?: boolean;
}

interface InputProps {
  name: keyof IFormInput;
  label?: string;
  type?: string;
  placeholder?: string;
}

const inputFields: InputProps[] = [
  {
    label: "First Name",
    name: "firstName",
    type: "text",
    placeholder: "Enter FIrst Name",
  },
  {
    label: "Last Name",
    name: "lastName",
    type: "text",
    placeholder: "Enter last Name",
  },
  {
    label: "Email",
    name: "email",
    type: "text",
    placeholder: "Enter email address",
  },
  {
    label: "Phone Number",
    name: "phoneNumber",
    type: "number",
    placeholder: "Enter phone number",
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "Enter password",
  },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    type: "password",
    placeholder: "Reenter Password",
  },
];

// Define the yup validation schema
const schema = yup
  .object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name cannot exceed 50 characters")
      .test(
        "no-multiple-spaces",
        "Only one space is allowed between words",
        (value) => !(value && (value.match(/\s{2,}/) || []).length > 0) // Check if there are two or more spaces in the string
      )
      .matches(
        /^[a-zA-Z]+( [a-zA-Z]+)*$/,
        "Contains only letters and 1 space between words"
      ),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name cannot exceed 50 characters")
      .test(
        "no-multiple-spaces",
        "Only one space is allowed between words",
        (value) => !(value && (value.match(/\s{2,}/) || []).length > 0) // Check if there are two or more spaces in the string
      )
      .matches(
        /^[a-zA-Z]+( [a-zA-Z]+)*$/,
        "Contains only letters and 1 space between words"
      ),
    email: yup
      .string()
      .required("Email is required")
      .email("Invalid email address")
      .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, {
        message: "Invalid email address",
        excludeEmptyString: true,
      })
      .matches(/^\S*$/, "Email cannot contain spaces"),
    phoneNumber: yup
      .string()
      .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile number is required"),
    password: yup
      .string()
      .required("Password is required")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .matches(/^\S*$/, "Password can't contain spaces")
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters"),
    confirmPassword: yup
      .string()
      .required("Password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),

    profilePic: yup
      .mixed<FileList>()
      .test("fileSize", "File too large", (value) => {
        if (value && value[0]) {
          return value[0].size <= 5 * 1024 * 1024; // 5MB
        }
        return true;
      })
      .test("fileType", "Unsupported file type", (value) => {
        if (value && value[0]) {
          return value[0].type.startsWith("image/");
        }
        return true;
      }),
    remember: yup.boolean(),
  })
  .required();

const Register = () => {
  // Hooks

  const [showGradient, containerRef] = useVerticalScrollable();

  const [showPasswords, setShowPasswords] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false,
  });
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema), // Use yup resolver for validation
  });

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPasswords((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // React Query Mutation
  const { mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Registration successful:", data);
    },
    onError: (err) => {
      console.error("Registration failed:", err);
    },
  });

  const onSubmit = async (data: IFormInput) => {
    // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();

    // console.log("Hi");

    // Access the file from profilePic
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    formData.append("remember", data.remember ? "true" : "false");

    if (data?.profilePic && data?.profilePic.length > 0) {
      const file = data.profilePic[0];
      const blob = new Blob([file], { type: file.type });
      formData.append("profilePic", blob, file.name);
      formData.append("folderName", "Profile_Pictures");
    }

    console.log("data", data);
    mutate(formData);
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

  // // States

  return (
    <div className="w-full min-h-dvh max-h-dvh h-full p-4 flex gap-4 overflow-hidden relative">
      <AuthRobot />
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
              register={{ ...register("profilePic" as keyof IFormInput) }}
              name="profilePic"
            />
          </div>
          <SocialAuth />
          <div className="w-full max-w-[400px] lg:max-w-[500px] sm:w-[90%] lg:w-[500px] border-gradient p-px rounded-3xl overflow-hidden mx-auto">
            <div className="shadow-light-dark-soft bg-platinum-black p-6 md:p-8 rounded-3xl space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-5 lg:gap-y-6">
                {inputFields.map((field, index) => {
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
                                  name as "password" | "confirmPassword"
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
                              name as "password" | "confirmPassword"
                            ] ? (
                              <EyeOffIcon />
                            ) : (
                              <EyeIcon />
                            ))
                          }
                          iconClick={() =>
                            togglePasswordVisibility(
                              name as "password" | "confirmPassword"
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
    </div>
  );
};

export default Register;
