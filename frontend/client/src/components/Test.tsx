import { CATEGORY } from "./Gallery";

const Test = () => {
  const test = CATEGORY.find((item) => item.title === "Character")
    ?.collections[2].items;

  console.log("test", test);

  return (
    <div>
      {test &&
        test?.map((item, index) => {
          return (
            <div key={index}>
              <img src={item.image} alt="" />
            </div>
          );
        })}
      Test
    </div>
  );
};

export default Test;
