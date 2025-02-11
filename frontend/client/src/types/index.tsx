import { HTMLInputAutoCompleteAttribute, ReactNode } from "react";

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

// Navbar Or Header
export type Subcategory = {
  id: number;
  category: string;
  label: string;
  level: number;
  subcategories?: Subcategory[]; // Recursive type for nested subcategories
};

export type Category = {
  id: number;
  category: string;
  label: string;
  level: number;
  subcategories?: Subcategory[]; // Top-level category containing subcategories
};
