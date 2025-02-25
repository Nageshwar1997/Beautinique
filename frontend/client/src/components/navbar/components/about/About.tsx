import Button from "../../../button/Button";
import CategoryLabel from "../CategoryLabel";
import SubCategories from "../SubCategories";
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
            const { subCategories, label } = category;
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
                <CategoryLabel text={label} />
                <SubCategories subCategories={subCategories} />
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
