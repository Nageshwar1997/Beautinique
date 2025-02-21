import { MessageIcon } from "../../../../icons";
import TextDisplay from "../../../TextDisplay";
import { lips } from "../../data/newData";
const feedbacks = [
  [
    { text: "Great variety of lipsticks! Loved the" },
    { text: "shades", isHighlighted: true },
    { text: "and" },
    { text: "textures.", isHighlighted: true },
    { text: "Long-lasting", isHighlighted: true },
    {
      text: "and comfortable. Perfect for every occasion. Highly recommended!",
    },
  ],
  [
    { text: "Amazing" },
    { text: "pigmentation", isHighlighted: true },
    { text: "and" },
    { text: "smooth application.", isHighlighted: true },
    { text: "Stays on for hours" },
    { text: "without drying out lips. Definitely a" },
    { text: "must-have!", isHighlighted: true },
    { text: "Long-lasting and" },
    { text: "comfortable.", isHighlighted: true },
  ],
  [
    { text: "Beautiful" },
    { text: "shades", isHighlighted: true },
    { text: "and great" },
    { text: "texture!", isHighlighted: true },
    { text: "Perfect" },
    { text: "matte", isHighlighted: true },
    { text: "finish without feeling heavy. Love the" },
    { text: "Long-lasting", isHighlighted: true },
    { text: "effect! Amazing quality and" },
    { text: "pigmentation.", isHighlighted: true },
  ],

  [
    { text: "Excellent" },
    { text: "color payoff!", isHighlighted: true },
    { text: "Super" },
    { text: "comfortable", isHighlighted: true },
    { text: "to wear all day. My" },
    { text: "go-to lipstick", isHighlighted: true },
    {
      text: "for every event. Worth every penny! Absolutely stunning luxurious.",
    },
  ],
  [
    { text: "Lovely" },
    { text: "shades", isHighlighted: true },
    { text: "with a" },
    { text: "creamy texture.", isHighlighted: true },
    { text: "No" },
    { text: "smudging", isHighlighted: true },
    {
      text: "and lasts all day. Received so many compliments. Absolutely love them! Truly fantastic.",
    },
  ],

  [
    { text: "The" },
    { text: "colors", isHighlighted: true },
    { text: "are vibrant and bold. Great for all" },
    { text: "skin tones.", isHighlighted: true },
    { text: "Stays" },
    { text: "intact", isHighlighted: true },
    { text: "and flawless" },
    { text: "even after meals. Highly recommended! Truly amazing." },
  ],
  [
    { text: "Impressive" },
    { text: "quality", isHighlighted: true },
    { text: "and" },
    { text: "shade range.", isHighlighted: true },
    { text: "Glides" },
    { text: "so" },
    { text: "smoothly", isHighlighted: true },
    {
      text: "and feels so lightweight. Absolutely perfect for both daily wear and special occasions!",
    },
  ],
];

const Lips = () => {
  const categories = lips.subCategories;

  // Get the current date
  const today = new Date();

  // Get the day of the month (1 to 31)
  const day = today.getDate();

  // Calculate the feedback index for today
  const feedbackIndex = day % feedbacks.length;

  // Get the feedback for today
  const todayFeedback = feedbacks[feedbackIndex];

  return (
    <div className="w-full space-y-2">
      <div className="p-4 xl:p-0 grid base:grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-3 md:gap-4 lg:grid-flow-col lg:auto-cols-fr justify-start w-full">
        {categories.map((category, index) => {
          return (
            <div
              key={index}
              className={`space-y-4 min-w-[250px]  base:min-w-[200px] base:max-w-[300px] w-full pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray lg:border-none ${
                ["lipsticks"].includes(category.category) ? "row-span-2" : ""
              }`}
            >
              <p
                className={`uppercase text-primary-battleship-davys-gray-inverted text-base sm:text-sm font-semibold font-degular tracking-wide leading-5 px-3 cursor-pointer pt-3 sm:pt-0 ${
                  category.category === "lipstick_sets_and_combos"
                    ? "lg:border-b lg:border-primary-battleship-davys-gray w-fit lg:mx-auto"
                    : ""
                }`}
              >
                {category?.label}
              </p>
              <div
                className={`flex flex-col ${
                  category.category === "lipsticks"
                    ? "gap-4 lg:gap-[18px] lg:py-2"
                    : "gap-1 sm:gap-2 lg:gap-3"
                }`}
              >
                {category.subCategories.map((subCategory, i) => {
                  const isHighlighted = subCategory.label === "Lipstick Combos";
                  const Icon = subCategory.icon;
                  return ["lip_care", "lipstick_sets_and_combos"].includes(
                    category.category
                  ) ? (
                    <div
                      key={i}
                      className={`flex justify-start gap-2 p-2 border border-transparent hover:bg-white-smoke-night-inverted rounded-xl cursor-pointer ${
                        isHighlighted
                          ? "hover:border-blue-crayola-c"
                          : "hover:border-primary-8"
                      } group`}
                    >
                      <div
                        className={`min-w-6 min-h-6 max-w-6 max-h-6 xl:min-w-8 xl:min-h-8 xl:max-w-8 xl:max-h-8 bg-secondary-inverted group-hover:bg-primary-inverted p-1 rounded-lg flex items-center justify-center ${
                          isHighlighted
                            ? "bg-accent-duo group-hover:shadow-primary-btn-hover [&>svg]:!fill-white"
                            : "shadow-inner shadow-primary-battleship-davys-gray"
                        }`}
                      >
                        <Icon className="fill-secondary w-full h-full" />
                      </div>
                      <div className="flex flex-col gap-0.5 justify-center lg:justify-start w-full text-silver-jet group-hover:text-secondary">
                        <p className="text-xs sm:text-[11px] xl:text-sm tracking-wide leading-3 text-left w-full text-secondary group-hover:text-primary lg:font-medium">
                          {subCategory.label}
                        </p>
                        <p className="text-[8px] xl:text-[10px] leading-none md:leading-3 break-words line-clamp-2 text-silver-jet group-hover:text-tertiary">
                          {/* {subCategory.description} */}
                          Lorem ipsum dolor sit amet, consectetur
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={i}
                      className="flex items-center gap-1 sm:gap-2 group"
                    >
                      <span>
                        <Icon className="fill-secondary w-5 h-5 sm:w-6 sm:h-6" />
                      </span>
                      <p className="text-sm sm:text-[13px] md:text-sm xl:text-sm w-full lg:font-medium tracking-wide leading-3 text-left text-tertiary group-hover:text-primary">
                        {subCategory.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="w-full max-h-[300px] col-span-2 overflow-y-scroll shadow-lg shadow-secondary-inverted hidden sm:block rounded-2xl">
          <img
            src="./images/navbar/1341.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-95 hover:opacity-100 cursor-pointer"
            loading="lazy"
          />
        </div>
        <div className="w-full max-h-[300px] col-span-2 overflow-y-scroll hidden lg:block shadow-lg shadow-secondary-inverted rounded-2xl">
          <img
            src="./images/navbar/1346.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
      </div>
      <hr className="hidden lg:block h-0.5 bg-primary-50" />
      <div className="w-full hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-2 w-fit">
          <MessageIcon className="w-3 h-3 fill-secondary" />
          <p className="text-[11px] xl:text-sm font-medium text-secondary text-nowrap">
            Some Feedbacks:
          </p>
        </div>
        <TextDisplay
          content={todayFeedback}
          contentClassName="text-[11px] xl:text-sm w-fit [&>span]:mr-1.5"
        />
      </div>
    </div>
  );
};

export default Lips;
