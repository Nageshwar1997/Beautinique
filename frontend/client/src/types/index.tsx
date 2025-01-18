import {
  ChangeEvent,
  HTMLInputAutoCompleteAttribute,
  KeyboardEvent,
  ReactNode,
} from "react";

export type ThemeTypes = "light" | "dark";

export interface InputProps {
  label?: string;
  name?: string;
  value?: string;
  icon?: ReactNode;
  errorText?: string;
  className?: string;
  placeholder?: string;
  successText?: string;
  defaultValue?: string;
  labelClassName?: string;
  iconClick?: () => void;
  type?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined;
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

export interface RegisterInputProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  profilePic?: string;
  remember?: boolean;
}

export interface LoginInputProps {
  email: string;
  phoneNumber: string;
  password: string;
  remember?: boolean;
}

export type PasswordVisibilityTypes = {
  password: boolean;
  confirmPassword: boolean;
};

export type LoginField = "email" | "password" | "phoneNumber" | "remember";

export type RegisterField = "firstName" | "lastName" | "email" | "phoneNumber";

export interface RadioProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}
