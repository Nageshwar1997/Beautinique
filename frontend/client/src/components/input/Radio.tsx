import { FC } from "react";
import { RadioProps } from "../../types";

const Radio: FC<RadioProps> = ({
  value,
  onChange,
  options,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-4 border border-primary-battleship-davys-gray w-min mx-auto rounded-full ${className}`}
    >
      <div className="relative flex items-center justify-between w-36 h-9 bg-smoke-eerie rounded-full shadow-primary-btn">
        {/* Toggle Background */}
        <div
          className={`absolute w-1/2 h-full bg-accent-duo rounded-full shadow-lg transform transition-transform duration-300 ease-in-out ${
            value === options[0].value ? "translate-x-0" : "translate-x-full"
          }`}
        />

        {options.map((option) => (
          <label
            key={option.value}
            className={`relative z-10 flex-1 text-center text-sm cursor-pointer ${
              value === option.value
                ? "text-white/90 font-semibold"
                : "text-primary-50 font-medium"
            }`}
          >
            <input
              type="radio"
              name="radio"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Radio;
