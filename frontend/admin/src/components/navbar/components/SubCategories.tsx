import { isHighlightedOption } from "../../../utils";
import { LevelThreeCategoryType } from "../types";

const SubCategories = ({
  subCategories,
  className = "",
}: {
  subCategories: LevelThreeCategoryType[];
  className?: string;
}) => {
  return (
    <div className={`flex flex-col gap-1 md:gap-2 ${className}`}>
      {subCategories.map((subCategory, index: number) => {
        const isHighlighted = isHighlightedOption(subCategory.category);
        const Icon = subCategory.icon;
        return (
          <div
            key={index}
            className={`flex justify-start gap-2 p-2 border border-transparent hover:bg-white-smoke-night-inverted rounded-xl cursor-pointer ${
              isHighlighted
                ? "hover:border-blue-crayola-c"
                : "hover:border-primary-8"
            } group`}
          >
            <div
              className={`min-w-10 min-h-10 max-w-10 max-h-10 xl:min-w-12 xl:min-h-12 xl:max-w-12 xl:max-h-12 bg-secondary-inverted group-hover:bg-primary-inverted rounded-lg flex items-center justify-center ${
                isHighlighted
                  ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white"
                  : "shadow-inner shadow-primary-battleship-davys-gray"
              }`}
            >
              <Icon className="fill-secondary" />
            </div>
            <div className="flex flex-col justify-center lg:justify-start w-full">
              <p className="text-xs xl:text-sm tracking-wide leading-3 text-left w-full text-secondary group-hover:text-primary line-clamp-1">
                {subCategory.label}
              </p>

              <p className="text-[8px] xl:text-[10px] leading-1 break-words line-clamp-2 text-silver-jet group-hover:text-tertiary">
                {subCategory.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubCategories;
