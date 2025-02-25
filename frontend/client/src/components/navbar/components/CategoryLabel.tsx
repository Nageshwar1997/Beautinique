const CategoryLabel = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => (
  <p
    className={`uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-left text-sm font-semibold tracking-wide leading-5 px-3 cursor-pointer line-clamp-1 ${className}`}
  >
    {text}
  </p>
);

export default CategoryLabel;
