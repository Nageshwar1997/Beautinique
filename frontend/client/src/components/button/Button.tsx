interface ButtonProps {
  type?: "submit" | "button";
  pattern: "primary" | "secondary" | "outline" | "transparent";
  className?: string;
  wrapperClassName?: string;
}

const Button = ({
  type = "button",
  pattern,
  wrapperClassName,
}: ButtonProps) => {
  const buttonCss = () => {
    if (pattern === "primary") {
      return "primary";
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

  const getButtonClassName = buttonCss();
  return (
    <div
      className={`border-none text-primary-inverted text-sm font-semibold font-metropolis leading-4 rounded-xl bg- flex justify-center items-center gap-1 bg-sky-blue-burst shadow-primary-btn hover:shadow-primary-btn-hover py-[18px] px-[22px] ${wrapperClassName}`}
      role="button"
    >
      <button type={type}>{getButtonClassName}</button>
    </div>
  );
};

export default Button;
