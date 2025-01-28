import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../configs/axios.instance.config";
import TestInput from "./TestInput";
import { useState } from "react";

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic: FileList; // Correctly type the file input
  remember?: boolean;
}

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
      .min(6, "Password must be at least 6 characters")
      .max(20, "Password cannot exceed 20 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&#]/,
        "Password must contain at least one special character"
      )
      .matches(/^\S*$/, "Password can't contain spaces"),

    confirmPassword: yup
      .string()
      .required("Password is required")
      .oneOf([yup.ref("password")], "Passwords must match"),

    profilePic: yup
      .mixed<FileList>()
      .required("File is required")
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

const XYZ = () => {
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const {
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

  const onSubmit = async (data: IFormInput) => {
    // Access the file from profilePic
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirmPassword);
    formData.append("remember", data.remember ? "true" : "false");

    if (data?.profilePic?.length > 0) {
      const file = data.profilePic[0];
      const blob = new Blob([file], { type: file.type });
      formData.append("profilePic", blob, file.name);
      formData.append("folderName", "Profile_Pictures");
    }

    try {
      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure you're sending form data as multipart
        },
      });

      console.log("API Response", response);
      // Handle the response from the server
    } catch (error) {
      console.error("API Error", error);
      // Handle the error
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-4"
      >
        <TestInput />
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Sign Up
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            First Name
          </label>
          <input
            type="text"
            {...register("firstName")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Last Name
          </label>
          <input
            type="text"
            {...register("lastName")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Phone Number
          </label>
          <input
            type="number"
            {...register("phoneNumber")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.password ? "text" : "password"}
              {...register("password")}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span
              className="absolute p-2 border right-0 top-1/2 transform -translate-y-1/2"
              onClick={() => togglePasswordVisibility("password")}
            >
              {showPasswords.password ? "H" : "S"}
            </span>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span
              className="absolute p-2 border right-0 top-1/2 transform -translate-y-1/2"
              onClick={() => togglePasswordVisibility("confirmPassword")}
            >
              {showPasswords.confirmPassword ? "H" : "S"}
            </span>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            {...register("profilePic")}
            className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md file:border-0 file:bg-gray-100 file:text-sm file:font-semibold file:text-gray-700 file:rounded-md file:py-2 file:px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.profilePic && (
            <p className="text-red-500 text-xs mt-1">
              {errors.profilePic.message}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              {...register("remember")}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            Remember Me
          </label>
          {errors.remember && (
            <p className="text-red-500 text-xs mt-1">
              {errors.remember.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default XYZ;
