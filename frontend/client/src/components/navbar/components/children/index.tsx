import { SVGType } from "../../../../types";
import { isHighlightedOption } from "../../../../utils";

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

export const SubCategoryIconBox = ({
  option,
  icon,
  className = "",
}: {
  option: string;
  icon: SVGType;
  className?: string;
}) => {
  const Icon = icon;
  const isHighlighted = isHighlightedOption(option);
  return (
    <div
      className={`min-w-10 min-h-10 max-w-10 max-h-10 xl:min-w-12 xl:min-h-12 xl:max-w-12 xl:max-h-12 bg-secondary-inverted group-hover:bg-primary-inverted rounded-lg flex items-center justify-center ${
        isHighlighted
          ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white"
          : "shadow-inner shadow-primary-battleship-davys-gray"
      } ${className}`}
    >
      <Icon className="fill-secondary" />
    </div>
  );
};
