import {
  TextItem,
  RegisterInputMapDataProps,
  LoginInputMapDataProps,
} from "../../../types";

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

export const loginInputMapData: LoginInputMapDataProps[] = [
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
    type: "number",
    autoComplete: "tel",
    placeholder: "Enter your phone number",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
    placeholder: "Enter your password",
  },
];
