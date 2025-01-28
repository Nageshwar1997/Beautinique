import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../configs/axios.instance.config";
import { useState } from "react";

interface IFormInput {
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
  label: string;
  type: string;
  toggle?: boolean;
}

const inputFields: InputProps[] = [
  { label: "First Name", name: "firstName", type: "text" },
  { label: "Last Name", name: "lastName", type: "text" },
  { label: "Email", name: "email", type: "email" },
  { label: "Phone Number", name: "phoneNumber", type: "number" },
  { label: "Password", name: "password", type: "password", toggle: true },
  {
    label: "Confirm Password",
    name: "confirmPassword",
    type: "password",
    toggle: true,
  },
  { label: "Profile Picture", name: "profilePic", type: "file" },
  { label: "Remember Me", name: "remember", type: "checkbox" },
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

const Home = () => {
  const [showPasswords, setShowPasswords] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
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

    if (data?.profilePic && data?.profilePic.length > 0) {
      const file = data.profilePic[0];
      const blob = new Blob([file], { type: file.type });
      formData.append("profilePic", blob, file.name);
      formData.append("folderName", "Profile_Pictures");
    }

    console.log("data", data);

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
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Sign Up
        </h2>

        {inputFields.map((field, index) => {
          const { label, name, type, toggle } = field;

          return (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-600">
                {label}
              </label>
              {type === "password" || type === "file" ? (
                <div className="relative">
                  <input
                    type={
                      name === "password" || name === "confirmPassword"
                        ? showPasswords[name as "password" | "confirmPassword"]
                          ? "text"
                          : type
                        : type
                    }
                    {...register(name)}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {toggle && (
                    <span
                      className="absolute p-2 border right-0 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        togglePasswordVisibility(
                          name as "password" | "confirmPassword"
                        )
                      }
                    >
                      {showPasswords[name as "password" | "confirmPassword"]
                        ? "H"
                        : "S"}
                    </span>
                  )}
                </div>
              ) : (
                <input
                  type={type}
                  {...register(name)}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[name]?.message}
                </p>
              )}
            </div>
          );
        })}

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

export default Home;
