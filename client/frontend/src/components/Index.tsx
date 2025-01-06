export const ColoredText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  return (
    <h1
      className={`bg-gradient-accent bg-clip-text text-transparent text-3xl font-semibold ${className}`}
    >
      {text}
    </h1>
  );
};
