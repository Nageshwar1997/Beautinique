import { FC, useState, ChangeEvent } from "react";
import { CheckMark, InfoIcon } from "./icons";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  name?: string;
  errorText?: string;
  readOnly?: boolean;
  successText?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  className?: string;
  register?: object;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  defaultValue?: string;
  labelClassName?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

const FloatingLabelInput: FC<InputProps> = ({
  label = "Name",
  placeholder = " ",
  type = "text",
  id = "name",
  name = "name",
  errorText = "errorText",
  readOnly,
  successText,
  onChange,
  value = "",
  className = "",
  register,
  onKeyDown,
  defaultValue,
  labelClassName = "",
  autoComplete,
  maxLength,
  minLength,
  pattern,
}) => {
  const [inputValue, setInputValue] = useState(value || defaultValue || "");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <div className="w-[400px] space-y-1">
      <div className="relative">
        {/* Input */}
        <input
          type={type}
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={`peer w-full focus:outline-none flex-grow outline-none font-normal text-base overflow-hidden bg-smoke-eerie rounded-xl border border-primary-inverted-10 px-8 py-4 text-primary-inverted ${className}`}
          {...register}
        />
        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute left-5 text-base text-primary-inverted ${
            inputValue ? "top-0" : "top-1/2"
          } transform -translate-y-1/2 transition-all duration-200 leading-none peer-focus:top-0 peer-focus:text-sm peer-focus:text-blue-500 cursor-text peer-focus:leading-none peer-focus:px-3 peer-focus:py-1 peer-focus:border peer-focus:border-primary-inverted-10 peer-focus:bg-smoke-eerie peer-focus:rounded-full ${labelClassName}`}
        >
          {label}
        </label>
      </div>

      {/* Error Message */}
      {errorText && !successText && !readOnly && (
        <span className="flex gap-1 items-center text-red-500 text-xs font-normal mt-2">
          <InfoIcon className="fill-red-500" />
          {errorText}
        </span>
      )}

      {/* Success Message */}
      {successText && !errorText && !readOnly && (
        <span className="flex gap-1 items-center text-green-500 text-xs font-normal">
          <CheckMark className="fill-green-500" />
          {successText}
        </span>
      )}
    </div>
  );
};

export default FloatingLabelInput;
