import { FC, HTMLInputAutoCompleteAttribute, ReactNode, SVGProps } from "react";

export type ThemeType = "light" | "dark";

export type ThemeStoreType = {
  theme: ThemeType;
  toggleTheme: () => void;
};

export interface FileInputProps {
  imageUrl?: string | null;
  name?: string;
  className?: string;
  register?: object;
}

export interface InputProps {
  type?: string;
  label?: string;
  name?: string;
  icon?: ReactNode;
  register?: object;
  errorText?: string;
  className?: string;
  placeholder?: string;
  successText?: string;
  containerClassName?: string;
  iconClick?: () => void;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
}

export interface TextItem {
  text: string;
  isHighlighted?: boolean;
  break?: boolean;
}

export interface TextDisplayProps {
  content: TextItem[];
  className?: string;
  contentClassName?: string;
}

export interface RegisterFormInputProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic?: FileList; // Correctly type the file input
  remember?: boolean;
}

export interface RegisterInputMapDataProps {
  name: keyof RegisterFormInputProps;
  label?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export type LoginTypes = "email" | "phoneNumber";

export interface LoginFormInputProps {
  loginMethod: LoginTypes;
  email?: string;
  phoneNumber?: string;
  password: string;
  remember?: boolean;
}

export interface LoginInputMapDataProps {
  name: keyof LoginFormInputProps;
  label?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export interface RadioProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export interface VerticalScrollType {
  top: boolean;
  bottom: boolean;
}

export interface HorizontalScrollType {
  left: boolean;
  right: boolean;
}

export interface IconType {
  className?: string;
}

export type SVGType = FC<SVGProps<SVGSVGElement>>;

export interface UserTypes {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStoreType {
  user: UserTypes | null;
  isAuthenticated: boolean;
  setUser: (user: UserTypes) => void;
  logout: () => void;
}
