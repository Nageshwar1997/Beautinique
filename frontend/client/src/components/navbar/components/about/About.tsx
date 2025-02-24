import { useEffect, useState } from "react";
import Button from "../../../button/Button";
import { careers, company, press, trust_center } from "./data";
import { YellowStarIcon } from "../../../../icons";

interface Testimonial {
  id: number;
  content: string;
  name: string;
  role: string;
  image: string;
}

const TestimonialCarousel: React.FC<{ testimonials: Testimonial[] }> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [testimonials.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  return (
    <div className="bg-ctruh-neutral p-4 rounded-lg flex flex-col">
      <div className="overflow-hidden">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`w-full ${
                index === currentIndex ? "block" : "hidden"
              }`}
            >
              {/* container for the content */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <YellowStarIcon key={index} className="w-4 h-4" />
                  ))}
                </div>
                <p className="text-primary base:h-[10vh] text-sm font-normal italic leading-[21px]">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-2">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    loading="lazy"
                  />
                  <div className="flex items-center gap-2 justify-between w-full">
                    <div>
                      <p className="text-primary text-xs font-semibold leading-[18px]">
                        {testimonial.name}
                      </p>
                      <p className="text-light-secondary text-[10px] font-normal leading-4">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        onClick={handlePrev}
                        className="cursor-pointer [&>path]:stroke-primary"
                      >
                        P
                      </span>
                      <span
                        onClick={handleNext}
                        className="cursor-pointer [&>path]:stroke-primary"
                      >
                        N
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Collections = () => {
  const colOneData = [company, press];
  const colTwoData = [careers, trust_center];

  const categories = [colOneData, colTwoData];

const testimonials = [
  {
    id: 1,
    content:
      "I absolutely love the range of products on this website! The quality is unmatched, and my skin has never felt better. I always get compliments!",
    name: "Ananya Sharma",
    role: "Beauty Enthusiast",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/krishna-gupta.webp",
  },
  {
    id: 2,
    content: `Finding the perfect shade was so easy. The product descriptions and customer reviews helped me make the right choice. Fast delivery too!`,
    name: "Sofia Patel",
    role: "Makeup Lover",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/aarav-joshi.webp",
  },
  {
    id: 3,
    content: `I love how the products feel on my skin. They are lightweight, long-lasting, and make me feel confident all day. Highly recommended!`,
    name: "Maya Williams",
    role: "Fashion Influencer",
    image:
      "https://ctruhcdn.azureedge.net/main-webiste/public/images/navbar/lucas-smith.webp",
  },
];

  return (
    <div className="p-4 lg:p-0 w-full h-full grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 content-center">
      {categories.map((item, i) => (
        <div key={i} className={`flex flex-col gap-2 border`}>
          {item.map((category, index) => {
            return (
              <div
                key={index}
                className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border border-primary-battleship-davys-gray !border-[red] ${
                  [
                    "traditional_and_essentials",
                    "setting_and_finishing",
                    "foundation_by_skin_type",
                    "concealers_and_correctors",
                  ].includes(category.category)
                    ? "lg:border-none"
                    : "lg:pb-2"
                } ${
                  category.category === "foundation_by_skin_type"
                    ? "base:pb-6 md:pb-4"
                    : ""
                }`}
              >
                <p className="uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer line-clamp-1">
                  {category?.label}
                </p>
                <div className="flex flex-col gap-1 md:gap-2">
                  {category.subCategories.map((subCategory, ind) => {
                    const isHighlighted = [""].includes(subCategory.category);
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
                          <p className="text-xs xl:text-sm tracking-wide leading-3 text-left w-full text-secondary group-hover:text-primary line-clamp-1">
                            {subCategory.label}
                          </p>
                          <p className="text-[8px] xl:text-[10px] leading-1 break-words line-clamp-2 text-silver-jet group-hover:text-tertiary">
                            {/* {subCategory.description} */}
                            Lorem ipsum dolor sit amet consectetur adipisicing
                            elit. Necessitatibus!
                          </p>
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
      <div className="border base:col-span-2 flex flex-col gap-2">
        <div className="w-full h-full lg:h-1/2 flex flex-col base:flex-row gap-5 border border-[red]">
          <div className="w-full max-h-[310px] lg:w-1/2 space-y-4 border border-[blue]">
            <p className="uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
              Peoples Love BQ
            </p>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
          <div className="w-full lg:w-1/2 space-y-4 border border-[yellow]">
            <p className="uppercase mt-3 md:mt-0 text-primary-battleship-davys-gray-inverted text-base base:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer">
              Partner with us
            </p>
            <div className="px-3 flex flex-col gap-4 items-start border border-[green]">
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
        <div className="w-full max-h-1/2 hidden lg:block min-h-[190px] xl:max-h-[260px]  shadow-lg shadow-secondary-inverted">
          <span className="w-full h-full overflow-hidden">
            <img
              src="./images/navbar/Lipstick1.jpg"
              alt=""
              className="w-full h-full rounded-xl object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
              loading="lazy"
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Collections;
