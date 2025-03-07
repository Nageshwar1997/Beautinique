import { ReactNode } from "react";

interface ButtonProps {
  type?: "submit" | "button";
  pattern: "primary" | "secondary" | "tertiary" | "outline" | "transparent";
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  content: ReactNode | string;
  onClick?: () => void;
  disable?: boolean;
}

const Button = ({
  type = "button",
  pattern,
  className = "",
  content,
  leftIcon,
  rightIcon,
  onClick,
  disable = false,
}: ButtonProps) => {
  const buttonCss = () => {
    if (pattern === "primary") {
      return "text-white bg-sky-blue-burst shadow-primary-btn hover:shadow-primary-btn-hover transition duration-300 border-none focus-within:border-none";
    } else if (pattern === "secondary") {
      return "text-secondary-inverted bg-secondary shadow-secondary-btn hover:shadow-secondary-btn-hover transition duration-300 border-none focus-within:border-none";
    } else if (pattern === "tertiary") {
      return "tertiary";
    } else if (pattern === "outline") {
      return "text-secondary hover:bg-tertiary hover:text-tertiary-inverted border border-tertiary";
    } else {
      return "transparent";
    }
  };

  const getButtonCSS = buttonCss();
  return (
    <button
      className={`w-full text-sm xl:text-base font-semibold font-metropolis leading-4 rounded-xl flex justify-center items-center gap-1 py-3 lg:py-4 px-4 lg:px-5 outline-none focus-within:outline-none cursor-pointer ${getButtonCSS} ${className}`}
      type={type}
      onClick={onClick ? onClick : () => {}}
      typeof="button"
      disabled={disable}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {content && <span>{content}</span>}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

export default Button;
