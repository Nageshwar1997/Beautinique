import { MessageIcon } from "../../../../icons";
import { getTodaysFeedback } from "../../../../utils";
import TextDisplay from "../../../TextDisplay";
import { collections } from "../../data";
import { LevelTwoCategoryType } from "../../types";
import { CategoryLabel, SubCategory } from "../children";

const Collections = () => {
  const categories: LevelTwoCategoryType[] = collections.subCategories;
  return (
    <div className="p-4 lg:p-0 w-full h-full space-y-4">
      <div className="grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 content-center">
        {categories.map((category, index) => (
          <div
            key={index}
            className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray lg:border-none ${
              category.category === "gifting"
                ? "md:col-span-3 lg:col-span-1 md:max-w-full lg:max-w-[300px]"
                : ""
            }`}
          >
            <CategoryLabel text={category?.label} />
            <div
              className={`flex flex-col gap-1 md:gap-2 ${
                category.category === "gifting"
                  ? "md:grid md:grid-cols-3 md:gap-4 lg:flex lg:flex-col lg:gap-2"
                  : ""
              }`}
            >
              {category.subCategories.map((subCategory, index) => (
                <SubCategory key={index} subCategory={subCategory} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex flex-col lg:flex-row lg:items-center gap-2 border-b pb-4 pt-0 lg:pb-0 lg:pt-4 lg:border-t lg:border-b-transparent border-primary-50">
        <div className="flex items-center gap-2 w-fit">
          <MessageIcon className="w-4 h-4 2xl:w-5 2xl:h-5 fill-secondary" />
          <p className="text-sm lg:text-[11px] xl:text-sm font-medium text-secondary text-nowrap">
            Some Feedbacks:
          </p>
        </div>
        <TextDisplay
          content={getTodaysFeedback(1)}
          contentClassName="text-[11px] xl:text-sm w-fit [&>span]:mr-1.5 !text-left !justify-start"
        />
      </div>
    </div>
  );
};

export default Collections;
