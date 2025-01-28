import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../configs/axios.instance.config";
import TestInput from "./TestInput";

interface IFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic: FileList; // Correctly type the file input
  rememberMe?: boolean;
}

// Define the yup validation schema
const schema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    //   .min(2, "First name must be at least 2 characters")
    //   .max(50, "First name cannot exceed 50 characters"),
    lastName: yup.string().required("Last name is required"),
    //   .min(2, "Last name must be at least 2 characters")
    //   .max(50, "Last name cannot exceed 50 characters"),
    email: yup
      .string()
      .email("Invalid email address")
      //   .matches(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, {
      //     message: "Invalid email address",
      //     excludeEmptyString: true,
      //   })
      .required("Email is required"),
    phoneNumber: yup
      .string()
      //   .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile number is required"),
    password: yup
      .string()
      //   .min(6, "Password must be at least 6 characters")
      //   .max(20, "Password cannot exceed 20 characters")
      //   .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      //   .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      //   .matches(/\d/, "Password must contain at least one number")
      //   .matches(
      //     /[@$!%*?&]/,
      //     "Password must contain at least one special character"
      //   )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      //   .min(6, "Password must be at least 6 characters")
      //   .max(20, "Password cannot exceed 20 characters")
      //   .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      //   .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      //   .matches(/\d/, "Password must contain at least one number")
      //   .matches(
      //     /[@$!%*?&]/,
      //     "Password must contain at least one special character"
      //   )
      //   .oneOf([yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm password is required"),
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
    rememberMe: yup.boolean(),
  })
  .required();

const XYZ = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    resolver: yupResolver(schema), // Use yup resolver for validation
  });

  const onSubmit = async (data: IFormInput) => {
    // Access the file from profilePic
    const formData = new FormData();

    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    formData.append("phoneNumber", data.phoneNumber);
    formData.append("password", data.password);
    // formData.append("confirmPassword", data.confirmPassword);
    // formData.append("rememberMe", data.rememberMe ? "true" : "false");

    if (data.profilePic && data.profilePic.length > 0) {
      const blob = new Blob([data.profilePic[0]], {
        type: data.profilePic[0].type,
      });
      formData.append("profilePic", blob);
    }

    // console.log("data", new Blob(formData));

    // formData.forEach((value, key) => {
    //   console.log(key, value); // Logs key-value pairs inside formData
    // });

    try {
      const response = await api.post("/test", formData, {
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

    // console.log("formData", formData);
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
          <input
            type="password"
            {...register("password")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
          <input
            type="password"
            {...register("confirmPassword")}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
              {...register("rememberMe")}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            Remember Me
          </label>
          {errors.rememberMe && (
            <p className="text-red-500 text-xs mt-1">
              {errors.rememberMe.message}
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
