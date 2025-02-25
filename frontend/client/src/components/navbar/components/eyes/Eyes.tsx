import { eyes } from "../../data";
import { LevelTwoCategoryType } from "../../types";
import CategoryLabel from "../CategoryLabel";
import SubCategories from "../SubCategories";

const Eyes = () => {
  const categories: LevelTwoCategoryType[] = eyes.subCategories;
  return (
    <div className="p-4 lg:p-0 grid base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 justify-start w-full">
      {categories.map((category, index) => {
        const { subCategories, label } = category;
        return (
          <div
            key={index}
            className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray ${
              ![
                "kohl_and_kajal",
                "mascaras",
                "eyeliners",
                "eyeshadow",
              ].includes(category.category)
                ? "lg:border-none"
                : "lg:pb-2"
            }`}
          >
            <CategoryLabel text={label} />
            <SubCategories subCategories={subCategories} />
          </div>
        );
      })}
      <div className="hidden lg:block w-full max-h-[190px] xl:max-h-[240px] col-span-2 overflow-hidden shadow-lg shadow-secondary-inverted rounded-xl mt-9">
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
