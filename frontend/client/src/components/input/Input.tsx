import { CheckMark, InfoIcon } from "../icons";
import { InputProps } from "../../types";

const Input = ({
  icon,
  name = "",
  type = "text",
  label = "",
  value = "",
  onChange,
  className = "",
  errorText = "",
  successText = "",
  placeholder = "",
  labelClassName = "",
  autoComplete = "off",
  iconClick,
}: InputProps) => {
  return (
    <div className="w-full space-y-1">
      <div className="relative min-h-10 lg:min-h-12">
        {/* Input */}
        <input
          autoComplete={autoComplete}
          aria-autocomplete="none"
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder ? placeholder : " "}
          className={`peer w-full flex-grow outline-none focus:outline-none font-normal text-base overflow-hidden bg-smoke-eerie rounded-lg border border-primary-inverted-10 px-4 py-2 lg:py-3 2xl:py-4 text-primary-inverted ${
            icon && "pr-10"
          } autofill-effect ${className}`}
        />
        {/* Floating Label */}
        {label && (
          <label
            htmlFor={name}
            className={`flex items-center justify-center text-[10px] lg:text-xs cursor-text absolute left-2 md:left-3 text-primary-inverted-50 leading-none ${
              value
                ? "top-0 px-1 md:px-2 py-0.5 border border-primary-inverted-10 text-[10px] lg:text-xs rounded bg-smoke-eerie"
                : "top-1/2 border border-transparent"
            } transform -translate-y-1/2 transition-all duration-200 leading-none peer-focus:top-0 peer-focus:text-[10px] peer-focus:lg:text-xs peer-focus:leading-none peer-focus:px-1 peer-focus:md:px-2 peer-focus:py-0.5 peer-focus:border peer-focus:border-primary-inverted-10 peer-focus:bg-smoke-eerie peer-focus:rounded ${labelClassName}`}
          >
            {label}
          </label>
        )}

        {/* Icon */}
        {icon && (
          <span
            onClick={iconClick && iconClick}
            className="h-full absolute top-0 right-3 flex justify-center items-center cursor-pointer"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Error Message */}
      {errorText && !successText && (
        <span className="flex md:gap-0.5 lg:gap-1 items-center text-[10px] md:text-xs font-normal mt-2 text-red-500">
          <InfoIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 fill-red-500" />
          {errorText}
        </span>
      )}
      {/* Success Message */}
      {successText && !errorText && (
        <span className="flex md:gap-0.5 lg:gap-1 items-center text-[10px] md:text-xs font-normal mt-2 text-green-500">
          <CheckMark className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 fill-green-500" />
          {successText}
        </span>
      )}
    </div>
  );
};

export default Input;
