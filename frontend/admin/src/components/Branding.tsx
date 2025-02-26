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
        Powered by BQ
      </p>
    </div>
  );
};

export default Branding;
