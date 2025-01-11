import { HorizontalLogo } from "./icons";

const Branding = ({
  type,
  className,
}: {
  type: "dark" | "light";
  className?: string;
}) => {
  return (
    <div
      className={`flex whitespace-nowrap gap-1 items-center opacity-65 ${className}`}
    >
      <p
        className={`font-metropolis font-normal text-[12px] leading-normal ${
          type === "light" ? "text-white" : "text-black"
        }`}
      >
        Powered by
      </p>
      <HorizontalLogo
        className={`${type === "light" ? "fill-white" : "fill-black"}`}
      />
    </div>
  );
};

export default Branding;
