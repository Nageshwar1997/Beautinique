import React from "react";
import { navData } from "../data/newData";

const HoveredComponent = ({ index }: { index: number }) => {
  if (index === null || index >= navData.length) {
    return null;
  }

  const Component = navData[index].component;

  console.log(
    "navData[index as number].component",
    navData[index as number].component
  );
  return <Component />;
};

export default HoveredComponent;
