import {
  LoginInputProps,
  TextItem,
  RegisterInputMapDataProps,
} from "../../../types";
import { isValidEmail, isValidPassword } from "../../../validators";

export const RegisterTextContent: TextItem[] = [
  {
    text: "Register",
    isHighlighted: true,
  },
];

export const LoginTextContent: TextItem[] = [
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

export const initialLoginData: LoginInputProps = {
  email: "",
  phoneNumber: "",
  password: "",
  remember: false,
};

export const registerInputMapData: RegisterInputMapDataProps[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    autoComplete: "given-name",
    placeholder: "Enter first name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    autoComplete: "given-name",
    placeholder: "Enter last name",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    autoComplete: "email",
    placeholder: "Enter email address",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "number",
    autoComplete: "tel",
    placeholder: "Enter phone number",
  },
  {
    label: "Password",
    name: "password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Enter password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Reenter password",
  },
];

export const loginInputMapData: {
  name: keyof LoginInputProps;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  icon?: boolean;
}[] = [
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
    placeholder: "Enter your password",
  },
];

export const validateLoginForm = (
  data: LoginInputProps,
  loginUsing: "email" | "phoneNumber"
) => {
  const { email, phoneNumber, password } = data;

  const updatedErrors: { [key: string]: string } = {};

  if (loginUsing === "email") {
    // Validate email if loginUsing is email
    if (!email) {
      updatedErrors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      updatedErrors.email = "Invalid email address.";
    }
  } else if (loginUsing === "phoneNumber") {
    // Validate phoneNumber if loginUsing is phoneNumber
    if (!phoneNumber) {
      updatedErrors.phoneNumber = "Phone number is required.";
    }
  }

  // Validate password (common for both cases)
  if (!password) {
    updatedErrors.password = "Password is required.";
  } else if (!isValidPassword(password)) {
    updatedErrors.password = "1 Upper, 1 Lower, 1 Num, 1 Symbol, 6+ chars.";
  }

  return updatedErrors;
};
