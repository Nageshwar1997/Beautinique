import {
  AuthInputProps,
  ContentItem,
  PasswordType,
  PasswordVisibilityTypes,
} from "../../../types";

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
  reminder: false,
  authType: "manual",
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
export const inputMapData: {
  name: keyof AuthInputProps;
  label: string;
  type: string;
  autoComplete: string;
  icon?: boolean;
}[] = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    autoComplete: "given-name",
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    autoComplete: "email",
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "text",
    autoComplete: "tel",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    icon: true,
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    autoComplete: "new-password",
    icon: true,
  },
];
