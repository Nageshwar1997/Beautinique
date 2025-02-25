export interface CategoryLabelProps {
  text: string;
  className?: string;
}
type SubCategoryLabel = CategoryLabelProps;
type SubCategoryDescriptionProps = CategoryLabelProps;

export const CategoryLabel = ({ text, className = "" }: CategoryLabelProps) => (
  <p
    className={`uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer ${className}`}
  >
    {text}
  </p>
);

export const SubCategoryLabel = ({
  text,
  className = "",
}: SubCategoryLabel) => (
  <p
    className={`text-xs xl:text-sm tracking-wide leading-3 text-left w-full text-secondary group-hover:text-primary line-clamp-1 ${className}`}
  >
    {text}
  </p>
);

export const SubCategoryDescription = ({
  text,
  className = "",
}: SubCategoryDescriptionProps) => (
  <p
    className={`text-[8px] xl:text-[10px] leading-1 break-words line-clamp-2 text-silver-jet group-hover:text-tertiary ${className}`}
  >
    {text}
  </p>
);
