import CategoryLabel from "../CategoryLabel";
import SubCategories from "../SubCategories";
import {
  bronzers_and_contours,
  cheeks_and_glow,
  concealers_and_correctors,
  face_makeup,
  foundations_by_finish,
  foundations_by_skin_type,
  primers_and_removers,
  setting_and_finishing,
  traditional_and_essentials,
} from "./data";

const Face = () => {
  const colOneData = [face_makeup, traditional_and_essentials];
  const colTwoData = [cheeks_and_glow, setting_and_finishing];
  const colThreeData = [foundations_by_finish, foundations_by_skin_type];
  const colFourData = [
    primers_and_removers,
    bronzers_and_contours,
    concealers_and_correctors,
  ];
  const categories = [colOneData, colTwoData, colThreeData, colFourData];

  return (
    <div className="p-4 lg:p-0 w-full h-full grid grid-cols-1 base:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 base:gap-3 md:gap-4 lg:gap-5 content-center">
      {categories.map((item, i) => (
        <div
          key={i}
          className={`flex flex-col gap-2 ${
            i === 3
              ? "md:col-span-3 md:flex-row md:justify-around lg:col-span-1 lg:flex-col lg:justify-start md:gap-4 lg:gap-[18px] xl:gap-6"
              : ""
          }`}
        >
          {item.map((category, index) => {
            const { subCategories, label } = category;
            return (
              <div
                key={index}
                className={`space-y-4 min-w-[200px] max-w-[300px] pb-4 lg:pb-0 border-b border-primary-battleship-davys-gray ${
                  [
                    "traditional_and_essentials",
                    "setting_and_finishing",
                    "foundations_by_skin_type",
                    "concealers_and_correctors",
                  ].includes(category.category)
                    ? "lg:border-none"
                    : "lg:pb-2"
                } ${
                  category.category === "foundations_by_skin_type"
                    ? "base:pb-[23px] md:pb-4"
                    : ""
                }`}
              >
                <CategoryLabel text={label} />
                <SubCategories subCategories={subCategories} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Face;
