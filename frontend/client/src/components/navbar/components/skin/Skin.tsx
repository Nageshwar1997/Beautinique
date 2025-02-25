import { LevelTwoCategoryType } from "../../types";
import { skin } from "../../data";
import { MessageIcon } from "../../../../icons";
import TextDisplay from "../../../TextDisplay";
import { getTodaysFeedback } from "../../../../utils";
import { CategoryLabel, SubCategory } from "../children";

const Skin = () => {
  const categories: LevelTwoCategoryType[] = skin.subCategories;
  return (
    <div className="p-4 lg:p-0 w-full h-full space-y-4">
      <div className="grid base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 justify-start w-full">
        {categories.map((category, index) => (
          <div
            key={index}
            className="space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray lg:border-none"
          >
            <CategoryLabel text={category?.label} />
            <div className="flex flex-col gap-1 md:gap-2">
              {category.subCategories.map((subCategory, index) => (
                <SubCategory key={index} subCategory={subCategory} />
              ))}
            </div>
          </div>
        ))}
        <div className="hidden md:block lg:hidden w-full max-h-[250px] col-span-2 overflow-y-scroll shadow-lg shadow-secondary-inverted rounded-2xl">
          <img
            src="./images/navbar/moisturizer.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
            loading="lazy"
          />
        </div>
      </div>
      <div className="w-full flex flex-col lg:flex-row lg:items-center gap-2 border-b pb-4 pt-0 lg:pb-0 lg:pt-4 lg:border-t lg:border-b-transparent border-primary-50">
        <div className="flex items-center gap-2 w-fit">
          <MessageIcon className="w-4 h-4 2xl:w-5 2xl:h-5 fill-secondary" />
          <p className="text-sm lg:text-[11px] xl:text-sm font-medium text-secondary text-nowrap">
            Some Feedbacks:
          </p>
        </div>
        <TextDisplay
          content={getTodaysFeedback()}
          contentClassName="text-[11px] xl:text-sm w-fit [&>span]:mr-1.5 !text-left !justify-start"
        />
      </div>
    </div>
  );
};

export default Skin;
