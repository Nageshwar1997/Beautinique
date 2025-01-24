import { ReactNode } from "react";

interface ButtonProps {
  type?: "submit" | "button";
  pattern: "primary" | "secondary" | "outline" | "transparent";
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  content: ReactNode | string;
  onClick?: () => void;
}

const Button = ({
  type = "button",
  pattern,
  className,
  content,
  leftIcon,
  rightIcon,
  onClick,
}: ButtonProps) => {
  const buttonCss = () => {
    if (pattern === "primary") {
      return "text-white bg-sky-blue-burst shadow-primary-btn hover:shadow-primary-btn-hover border-none focus-within:border-none";
    } else if (pattern === "secondary") {
      return "secondary";
    } else if (pattern === "outline") {
      return "outline";
    } else if (pattern === "transparent") {
      return "transparent";
    } else {
      return "";
    }
  };

  const getButtonCSS = buttonCss();
  return (
    <button
      className={`w-full text-sm font-semibold font-metropolis leading-4 rounded-xl flex justify-center items-center gap-1 py-3 lg:py-4 px-4 lg:px-5 outline-none focus-within:outline-none ${getButtonCSS} ${className}`}
      type={type}
      onClick={onClick ? onClick : () => {}}
      typeof="button"
    >
      {leftIcon && <span>{leftIcon}</span>}
      {content && <span>{content}</span>}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;
