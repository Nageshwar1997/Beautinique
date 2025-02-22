import { eyes } from "../../data";
import { LevelTwoCategoryType } from "../../types";

const Eyes = () => {
  const categories: LevelTwoCategoryType[] = eyes.subCategories;
  return (
    <div className="p-4 xl:p-0 grid base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 justify-start w-full">
      {categories.map((category, index) => (
        <div
          key={index}
          className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray ${
            !["kohl_and_kajal", "mascaras"].includes(category.category)
              ? "lg:border-none lg:pb-2"
              : ""
          }`}
        >
          <p className="uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
            {category?.label}
          </p>
          <div className="flex flex-col gap-1 md:gap-2 lg:gap-5">
            {category.subCategories.map((subCategory, index) => {
              const isHighlighted = [
                "kohl",
                "curl_lengthening_mascara",
                "liquid_eyeliner",
                "glitter_eyeshadow",
                "brow_pencil",
                "eye_combo",
              ].includes(subCategory.category);
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
                    className={`min-w-10 min-h-10 max-w-10 max-h-10 xl:min-w-14 xl:min-h-14 xl:max-w-14 xl:max-h-14 bg-secondary-inverted group-hover:bg-primary-inverted rounded-lg flex items-center justify-center ${
                      isHighlighted
                        ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white"
                        : "shadow-inner shadow-primary-battleship-davys-gray"
                    }`}
                  >
                    <Icon className="fill-secondary" />
                  </div>
                  <div className="flex flex-col justify-center lg:justify-start gap-1 w-full">
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
        </div>
      ))}
      <div className="hidden lg:block w-full max-h-[280px] col-span-2 overflow-y-scroll shadow-lg shadow-secondary-inverted rounded-2xl">
        <img
          src="./images/navbar/Mascara.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Eyes;
