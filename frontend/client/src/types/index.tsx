import { ChangeEvent, KeyboardEvent, ReactNode } from "react";

export type ThemeTypes = "light" | "dark";

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
  name?: string;
  errorText?: string;
  successText?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  register?: object;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  labelClassName?: string;
  icon?: ReactNode;
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
