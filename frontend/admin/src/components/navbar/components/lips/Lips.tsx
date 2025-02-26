import { LevelTwoCategoryType } from "../../types";
import { lips } from "../../data";
import CategoryLabel from "../CategoryLabel";
import SubCategories from "../SubCategories";

const Lips = () => {
  const categories: LevelTwoCategoryType[] = lips.subCategories;

  return (
    <div className="p-4 lg:p-0 w-full h-full grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 content-center">
      {categories.map((category, index) => {
        const { subCategories, label } = category;
        return (
          <div
            key={index}
            className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray ${
              [
                "finish_types",
                "lipstick_forms",
                "long_lasting_lipsticks",
                "lip_care",
              ].includes(category.category)
                ? category.category === "lip_care"
                  ? "lg:border-transfer lg:pb-0 xl:pb-2 xl:border-primary-battleship-davys-gray"
                  : "lg:pb-2"
                : "lg:border-none"
            }`}
          >
            <CategoryLabel text={label} />
            <SubCategories subCategories={subCategories} />
          </div>
        );
      })}
      <div className="w-full min-h-[190px] xl:max-h-[220px] mt-10 col-span-2 shadow-lg shadow-secondary-inverted hidden xl:flex items-center justify-center gap-5">
        <span className="w-1/2 h-full rounded-xl overflow-hidden">
          <img
            src="./images/navbar/Lipstick1.jpg"
            alt=""
            className="h-full object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
            loading="lazy"
          />
        </span>
        <span className="w-1/2 h-full rounded-xl overflow-hidden">
          <img
            src="./images/navbar/Lipstick2.jpg"
            alt=""
            className="h-full object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
            loading="lazy"
          />
        </span>
      </div>
    </div>
  );
};

export default Lips;
