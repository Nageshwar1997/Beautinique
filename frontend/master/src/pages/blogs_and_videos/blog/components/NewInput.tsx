import { UseFormRegisterReturn } from "react-hook-form";
import Button from "../../../../components/button/Button";
import { InfoIcon, RightArrowIcon } from "../../../../icons";
import { ChangeEvent, KeyboardEvent, ReactNode } from "react";

export type NewInputProps = {
  label?: string;
  id?: string;
  register?: UseFormRegisterReturn;
  placeholder: string;
  type?: "text" | "email" | "password" | "number";
  errorText?: string;
  readOnly?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  textareaClassName?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconClick?: () => void;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  needButton?: boolean;
  btnOnClick?: () => void;
};
const NewInput = ({
  label,
  id = "",
  register,
  placeholder,
  className = "",
  errorText = "",
  inputClassName = "",
  labelClassName = "",
  readOnly = false,
  type = "text",
  leftIcon,
  rightIcon,
  iconClick,
  value,
  onChange,
  onKeyDown,
  needButton,
  btnOnClick,
}: NewInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    register?.onChange?.(event);
  };

  const hasError = errorText && !readOnly;

  return (
    <div className={`relative flex flex-col font-lufga ${label && "gap-2"}`}>
      {label && (
        <label
          htmlFor={id}
          className={`text-xs leading-3 text-primary cursor-pointer ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center bg-primary border border-secondary rounded-lg overflow-hidden relative ${className}`}
      >
        {leftIcon && (
          <span
            onClick={iconClick}
            className="absolute top-1/2 left-1 transform -translate-y-1/2"
          >
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={readOnly}
          value={value}
          className={`border-none flex-grow outline-none focus:outline-none text-primary-inverted placeholder:text-secondary-inverted text-xs leading-3 h-full !px-input-padding-x !py-input-padding-y disabled:cursor-not-allowed ${
            leftIcon ? "pl-4" : rightIcon ? "pr-4" : ""
          } ${inputClassName}`}
          {...register}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
        {needButton && (
          <Button
            pattern="primary"
            onClick={btnOnClick}
            content=""
            leftIcon={<RightArrowIcon />}
            // wrapperClassName="!h-8 rounded-none bg-surface-dark-primary "
            className="!w-[100px] !py-2"
          />
        )}
        {rightIcon && (
          <span
            onClick={iconClick}
            className="absolute top-1/2 right-1 transform -translate-y-1/2"
          >
            {rightIcon}
          </span>
        )}
      </div>
      {hasError && (
        <span className="flex gap-1 items-start justify-start text-error text-xs font-normal">
          <InfoIcon className="min-w-4 h-4 fill-red-600" />
          {errorText}
        </span>
      )}
    </div>
  );
};

export default NewInput;
