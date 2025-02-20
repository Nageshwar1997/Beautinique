import { skin } from "../../data/newData";

const Skin = () => {
  const categories = skin.subCategories;
  return (
    <div className="p-4 xl:p-0 grid sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6 justify-center w-full">
      {categories.map((category, index) => (
        <div
          key={index}
          className="space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray lg:border-none"
        >
          <p className="uppercase text-center lg:mt-0 text-primary-battleship-davys-gray-inverted text-base lg:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
            {category?.label}
          </p>
          <div className="flex flex-col gap-1 md:gap-2 lg:gap-5">
            {category.subCategories.map((subCategory, index) => {
              const isSerum = subCategory.label === "Serum";
              const Icon = subCategory.icon;
              return (
                <div
                  key={index}
                  className={`flex justify-start gap-2 p-2 border border-transparent hover:bg-white-smoke-night-inverted rounded-xl cursor-pointer ${
                    isSerum
                      ? "hover:border-blue-crayola-c"
                      : "hover:border-primary-8"
                  } group`}
                >
                  <div
                    className={`min-w-10 min-h-10 max-w-10 max-h-10 xl:min-w-14 xl:min-h-14 xl:max-w-14 xl:max-h-14 bg-secondary-inverted group-hover:bg-primary-inverted z-10 rounded-lg flex items-center justify-center ${
                      isSerum
                        ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white opacity-100"
                        : "shadow-inner shadow-primary-battleship-davys-gray"
                    }`}
                  >
                    <Icon className="z-20 fill-secondary" />
                  </div>
                  <div className="flex flex-col justify-center lg:justify-start gap-1 w-full">
                    <p className="text-xs xl:text-sm tracking-wide leading-3 text-left w-full">
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
