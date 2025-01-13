import { useState, ChangeEvent } from "react";
import { CheckMark, InfoIcon } from "./icons";
import { InputProps } from "../types";

const Input = ({
  icon,
  name = "",
  type = "text",
  label = "",
  value = "",
  register,
  onChange,
  className = "",
  errorText = "",
  successText = "",
  placeholder = "",
  labelClassName = "",
}: InputProps) => {
  const [inputValue, setInputValue] = useState(value || "");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div className="w-full space-y-1">
      <div className="relative">
        {/* Input */}
        <input
          autoComplete="off"
          type={type}
          id={name}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder ? placeholder : " "}
          className={`peer w-full focus:outline-none flex-grow outline-none font-normal text-base overflow-hidden bg-smoke-eerie rounded-xl border border-primary-inverted-10 p-4 text-primary-inverted ${
            icon && "pr-10"
          } ${className}`}
          {...register}
        />
        {/* Floating Label */}
        {label && (
          <label
            htmlFor={name}
            className={`flex items-center justify-center absolute left-3 text-primary-inverted ${
              inputValue
                ? "top-0 py-1 px-3 border border-primary-inverted-10 text-sm rounded-xl bg-smoke-eerie"
                : "top-1/2 border border-transparent"
            } transform -translate-y-1/2 transition-all duration-200 leading-none peer-focus:top-0 peer-focus:text-sm cursor-text peer-focus:leading-none peer-focus:px-3 peer-focus:py-1 peer-focus:border peer-focus:border-primary-inverted-10 peer-focus:bg-smoke-eerie peer-focus:rounded-xl ${labelClassName}`}
          >
            {label}
          </label>
        )}

        {/* Icon */}
        {icon && (
          <span
            className="h-full absolute top-0 right-0 p-3 flex justify-center items-center"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Error Message */}
      {errorText && !successText && (
        <span className="flex gap-1 items-center text-red-500 text-xs font-normal mt-2">
          <InfoIcon className="fill-red-500" />
          {errorText}
        </span>
      )}
      {/* Success Message */}
      {successText && !errorText && (
        <span className="flex gap-1 items-center text-green-500 text-xs font-normal">
          <CheckMark className="fill-green-500" />
          {successText}
        </span>
      )}
    </div>
  );
};

export default Input;
