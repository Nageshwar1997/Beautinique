import { CheckMark, InfoIcon } from "../icons";
import { InputProps } from "../../types";

const PhoneInput = ({
  icon,
  name = "",
  type = "text",
  label = "",
  register,
  className = "",
  errorText = "",
  successText = "",
  placeholder = "",
  containerClassName = "",
  autoComplete = "off",
  iconClick,
}: InputProps) => {
  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      <div className="relative min-h-10 lg:min-h-12">
        {label && (
          <label
            htmlFor={name}
            className={`text-[10px] lg:text-xs text-primary-50 absolute top-0 left-3 transform -translate-y-1/2 border border-primary-10 leading-none px-1 md:px-2 py-0.5 xl:py-1 bg-smoke-eerie rounded cursor-pointer`}
          >
            {label}
          </label>
        )}
        {/* Input */}
        <div className="w-full text-sm xl:text-base flex bg-smoke-eerie rounded-lg border border-primary-10 text-primary">
          <p className="w-[16%] text-primary-50 content-center text-center border-r border-primary-10 py-3 2xl:py-4">
            +91
          </p>
          <input
            autoComplete={autoComplete}
            aria-autocomplete="none"
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            {...register}
            className={`w-full outline-none focus:outline-none font-normal overflow-hidden bg-transparent px-3 py-3 2xl:py-4 placeholder:text-primary-50 placeholder:text-sm ${
              icon && "pr-10"
            } autofill-effect number-input-mouse-control-none ${className}`}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </div>

        {/* Icon */}
        {icon && (
          <span
            onClick={iconClick && iconClick}
            className="h-full absolute top-0 right-0 pr-2 flex justify-center items-center cursor-pointer"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Error Message */}
      {errorText && !successText && (
        <span className="w-full text-start flex gap-1 items-center text-[11px] leading-tight mt-2 text-red-500">
          <InfoIcon className="w-3 h-3 md:w-4 md:h-4 fill-red-500" />
          {errorText}
        </span>
      )}
      {/* Success Message */}
      {successText && !errorText && (
        <span className="w-full text-start flex gap-1 items-center text-[11px] leading-tight mt-2 text-green-500">
          <CheckMark className="w-3 h-3 md:w-4 md:h-4 fill-green-500" />
          {successText}
        </span>
      )}
    </div>
  );
};

export default PhoneInput;
