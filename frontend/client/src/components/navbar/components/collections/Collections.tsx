import { MessageIcon } from "../../../../icons";
import { getTodaysFeedback } from "../../../../utils";
import TextDisplay from "../../../TextDisplay";
import { collections } from "../../data";
import { LevelTwoCategoryType } from "../../types";
import { CategoryLabel, SubCategoryDescription } from "../children";

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
              {category.subCategories.map((subCategory, ind) => {
                const isHighlighted = [
                  "body_care",
                  "body_spray",
                  "conditioner",
                  "corporate_gifting",
                ].includes(subCategory.category);
                const Icon = subCategory.icon;

                const isHairCareViewAll =
                  subCategory.category === "view_all" &&
                  category.category === "hair_care";

                return (
                  <div
                    key={ind}
                    className={`flex justify-start gap-2 p-2 border border-transparent hover:bg-white-smoke-night-inverted rounded-xl cursor-pointer s${
                      isHighlighted
                        ? "hover:border-blue-crayola-c"
                        : "hover:border-primary-8"
                    } ${isHairCareViewAll ? "base:hidden md:flex" : ""} group`}
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
                      <SubCategoryDescription text={subCategory.description} />
                    </div>
                  </div>
                );
              })}
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
