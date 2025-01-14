import { ChangeEvent, KeyboardEvent, ReactNode } from "react";

export type ThemeTypes = "light" | "dark";

export interface InputProps {
  label?: string;
  name?: string;
  value?: string | number | readonly string[];
  icon?: ReactNode;
  errorText?: string;
  className?: string;
  placeholder?: string;
  successText?: string;
  defaultValue?: string;
  labelClassName?: string;
  type?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface TextItem {
  text: string;
  isHighlighted?: boolean;
  break?: boolean;
}

export type ContentItem = TextItem;

export interface TextDisplayProps {
  content: ContentItem[];
  className?: string;
  contentClassName?: string;
}

export interface AuthInputProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic?: string;
  hasIcon?: boolean;
  reminder?: boolean;
  authType?: "social" | "manual";
}
