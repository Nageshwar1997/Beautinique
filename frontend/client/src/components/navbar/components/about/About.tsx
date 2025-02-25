import Button from "../../../button/Button";
import {
  CategoryLabel,
  SubCategoryDescription,
  SubCategoryLabel,
} from "../children";
import { careers, company, press, testimonials, trust_center } from "./data";
import TestimonialCarousel from "./TestimonialCarousel";

const Collections = () => {
  const colOneData = [company, press];
  const colTwoData = [careers, trust_center];

  const categories = [colOneData, colTwoData];

  return (
    <div className="p-4 lg:p-0 grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 gap-2 base:gap-3 md:gap-4 lg:gap-5 justify-start content-start">
      {categories.map((item, i) => (
        <div key={i} className={`flex flex-col gap-2 w-fit`}>
          {item.map((category, index) => {
            return (
              <div
                key={index}
                className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray ${
                  ["press", "trust_center_and_legal"].includes(
                    category.category
                  )
                    ? "lg:border-none"
                    : "lg:pb-2"
                }`}
              >
                <CategoryLabel text={category?.label} />
                <div className="flex flex-col gap-1 md:gap-2">
                  {category.subCategories.map((subCategory, ind) => {
                    const isHighlighted = ["mission_vision_values"].includes(
                      subCategory.category
                    );
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
                          <SubCategoryLabel text={subCategory.label} />
                          <SubCategoryDescription
                            text={subCategory.description}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="grid base:grid-cols-2 md:grid-cols-1 gap-2 base:col-span-2 md:col-span-1 w-full">
        <div className="space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-2 border-b border-primary-battleship-davys-gray">
          <CategoryLabel text={"Peoples Love BQ"} />
          <TestimonialCarousel testimonials={testimonials} />
        </div>
        <div className="space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-2 border-b border-primary-battleship-davys-gray lg:border-none">
          <CategoryLabel text={"Partner with us"} />
          <div className="px-3 space-y-4">
            <span className="bg-accent-duo bg-clip-text text-transparent italic text-sm font-medium leading-[21px]">
              Together, we're Unstoppable!
            </span>
            <Button
              content={"Team Up"}
              pattern="outline"
              className="!w-fit !py-1 !rounded-full leading-3 !text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
