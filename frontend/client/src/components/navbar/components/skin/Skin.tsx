import { skin } from "../../data/newData";
import { FaceMakeupIcon } from "../icons";

const Skin = () => {
  const categories = skin.subCategories;
  return (
    <div className="md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:gap-6 justify-center w-full">
      {categories.map((category, index) => (
        <div key={index} className="space-y-4 min-w-[200px] max-w-[250px]">
          <p className="uppercase text-primary-battleship-davys-gray-inverted text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
            {category?.label}
          </p>
          <div className="flex flex-col gap-5 md:gap-1">
            {category.subCategories.map((subCategory, index) => {
              const isSerums = subCategory.label === "Serums";
              return (
                <div
                  key={index}
                  className={`flex gap-1 justify-between lg:gap-2 p-0 md:p-2 border border-transparent hover:bg-white-smoke-night-inverted active:bg-white-smoke-night-inverted rounded-xl cursor-pointer ${
                    isSerums
                      ? "md:active:border-[#07f] lg:hover:border-[#07f]"
                      : "md:active:border-primary-8 lg:hover:border-primary-8"
                  } group`}
                >
                  <div
                    className={`min-w-10 min-h-10 max-w-10 max-h-10 xl:min-w-12 xl:min-h-12 xl:max-w-12 xl:max-h-12 group-hover:bg-primary-inverted z-10 opacity-80 group-hover:opacity-100 rounded-lg flex items-center justify-center ${
                      isSerums
                        ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white opacity-100"
                        : "shadow-inner shadow-primary-battleship-davys-gray group-hover:shadow-inner group-hover:shadow-secondary-battleship-davys-gray"
                    }`}
                  >
                    <FaceMakeupIcon className="z-20 fill-secondary" />
                  </div>
                  <div className="flex flex-col justify-start">
                    <p className="text-xs xl:text-sm tracking-wide leading-3 text-left flex-1">
                      {subCategory.label}
                    </p>
                    <p className="text-[8px] xl:text-[10px] leading-1 break-words line-clamp-2">
                      {subCategory.description}
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

export default Skin;
