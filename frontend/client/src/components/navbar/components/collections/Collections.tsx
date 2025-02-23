import { collections } from "../../data";
import { LevelTwoCategoryType } from "../../types";

const Collections = () => {
  const categories: LevelTwoCategoryType[] = collections.subCategories;
  return (
    <div className="w-full h-full grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 content-center">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray lg:border-none ${
            category.category === "gifting"
              ? "md:col-span-3 lg:col-span-1 md:max-w-full lg:max-w-[300px]"
              : ""
          }`}
        >
          <p className="uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
            {category?.label}
          </p>
          <div
            className={`flex flex-col gap-1 md:gap-2 ${
              category.category === "gifting"
                ? "md:grid md:grid-cols-3 md:gap-4 lg:flex lg:flex-col lg:gap-1"
                : ""
            }`}
          >
            {category.subCategories.map((subCategory, ind) => {
              const isHighlighted = [""].includes(subCategory.category);
              const Icon = subCategory.icon;

              return (
                <div
                  key={ind}
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
                      {/* {subCategory.description} */}
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Necessitatibus!
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Collections;
