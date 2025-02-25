import { FC } from "react";

export interface CategoryLabelProps {
  text: string;
  className?: string;
}

// type SubCategoryLabel = CategoryLabelProps;
type SubCategoryDescriptionProps = CategoryLabelProps;

export const CategoryLabel: FC<CategoryLabelProps> = ({
  text,
  className = "",
}) => {
  return (
    <p
      className={`uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer ${className}`}
    >
      {text}
    </p>
  );
};

export const SubCategoryDescription: FC<SubCategoryDescriptionProps> = ({
  text,
  className = "",
}) => {
  return (
    <p
      className={`text-[8px] xl:text-[10px] leading-1 break-words line-clamp-2 text-silver-jet group-hover:text-tertiary ${className}`}
    >
      {text}
    </p>
  );
};
