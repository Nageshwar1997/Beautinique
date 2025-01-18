import {
  AuthInputProps,
  ContentItem,
  PasswordType,
  PasswordVisibilityTypes,
} from "../../../types";
import { isValidEmail, isValidPassword } from "../../../validators";

export const RegisterTextContent: ContentItem[] = [
  {
    text: "Register",
    isHighlighted: true,
  },
];

export const LoginTextContent: ContentItem[] = [
  {
    text: "Login",
    isHighlighted: true,
  },
];

export const socialMediaAccounts = [
  {
    name: "Google",
    url: "https://ctruhcdn.azureedge.net/public/images/login/google.webp",
  },
  {
    name: "Facebook",
    url: "https://ctruhcdn.azureedge.net/public/images/login/facebook.webp",
  },
  {
    name: "Github",
    url: "https://ctruhcdn.azureedge.net/public/images/login/github_logo.webp",
  },
  {
    name: "Linkedin",
    url: "https://ctruhcdn.azureedge.net/public/images/login/linkedin.webp",
  },
];

export const initialRegisterData: AuthInputProps = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  profilePic: "",
  remember: false,
  authType: "manual",
};
export const initialLoginData = {
  email: "" as keyof AuthInputProps,
  phoneNumber: "" as keyof AuthInputProps,
  password: "" as keyof AuthInputProps,
  remember: false as boolean,
  authType: "manual" as keyof AuthInputProps,
};

export const getPasswordFieldType = (
  field: keyof PasswordVisibilityTypes,
  passwordVisibility: PasswordVisibilityTypes
): PasswordType => {
  if (["password", "confirmPassword"].includes(field)) {
    return passwordVisibility[field] ? "text" : "password";
  }
  return "text";
};

// Define the inputMapData outside the component
export const registerInputMapData: {
  name: keyof AuthInputProps;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  icon?: boolean;
}[] = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      autoComplete: "given-name",
      placeholder: "Enter your first name",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      autoComplete: "given-name",
      placeholder: "Enter your last name",
    },
    {
      name: "email",
      label: "Email",
      type: "text",
      autoComplete: "email",
      placeholder: "Enter your email address",
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "text",
      autoComplete: "tel",
      placeholder: "Enter your phone number",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      autoComplete: "new-password",
      icon: true,
      placeholder: "Enter new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      autoComplete: "new-password",
      icon: true,
      placeholder: "Confirm new password",
    },
  ];

export const validateRegisterForm = (data: AuthInputProps) => {
  const { firstName, lastName, email, phoneNumber, password, confirmPassword } =
    data;

  const updatedErrors: { [key: string]: string } = {};

  if (!firstName) {
    updatedErrors.firstName = "First name is required.";
  }

  if (!lastName) {
    updatedErrors.lastName = "Last name is required.";
  }

  if (!email) {
    updatedErrors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    updatedErrors.email = "Invalid email address.";
  }

  if (!phoneNumber) {
    updatedErrors.phoneNumber = "Phone number is required.";
  }

  if (!password) {
    updatedErrors.password = "Password is required.";
  } else if (!isValidPassword(password)) {
    updatedErrors.password = "1 Upper, 1 Lower, 1 Num, 1 Symbol, 6+ chars.";
  }

  if (!confirmPassword) {
    updatedErrors.confirmPassword = "Confirm password is required.";
  }

  if (password !== confirmPassword) {
    updatedErrors.confirmPassword = "Passwords do not match.";
  }

  return updatedErrors;
};
