import * as yup from "yup";

export const registerSchema = yup
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
      .matches(/^[6-9]/, "Mobile number must start with 6, 7, 8, or 9")
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
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
