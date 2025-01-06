import { ChangeEvent, ReactNode } from "react";
import { InfoIcon } from "./icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  id?: string;
  type?: "text" | "email" | "password";
  name?: string;
  value?: string;
  errorText?: string;
  successText?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  icon?: ReactNode;
  iconClassName?: string;

  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
const Input = ({
  className = "",
  label = "",
  id = "",
  placeholder = " ",
  labelClassName = "",
  inputClassName = "",
  icon,
  iconClassName,
  type = "text",
  errorText,
  successText,
}: InputProps) => {
  return (
    <div className={`font-metropolis relative border ${className}`}>
      {label && (
        <label
          htmlFor={id || ""}
          className={`text-lg label font-semibold ${labelClassName}`}
        >
          {label} :
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`focus:outline-none flex-grow outline-none font-normal text-base overflow-hidden ${inputClassName}`}
      />
      {icon && (
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 ${iconClassName}`}
        >
          {icon}
        </div>
      )}
      {errorText && !successText &&<span className="flex gap-1 items-center text-red-500 text-xs font-normal mt-2">
        <InfoIcon className="fill-red-500" />
        {errorText}
      </span>}
    </div>
  );
};

export default Input;
