interface CategoryLabelProps {
  label: string;
  className?: string;
}
const CategoryLabel = ({ label, className = "" }: CategoryLabelProps) => {
  return (
    <p
      className={`uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer ${className}`}
    >
      {label}
    </p>
  );
};

export default CategoryLabel;
