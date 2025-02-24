import { navbarCategoriesData } from "../data";

const HoveredComponent = ({ index }: { index: number }) => {
  if (index === null || index >= navbarCategoriesData.length) {
    return null;
  }

  const Component = navbarCategoriesData[index].component;

  return (
    <div className="lg:p-px lg:bg-primary-battleship-davys-gray lg:rounded-xl h-full backdrop-blur-3xl max-w-[1300px] shadow-navbar-card">
      <div className="bg-platinum-black text-secondary lg:p-5 lg:bg-secondary-inverted lg:rounded-xl lg:font-metropolis">
        <Component />
      </div>
    </div>
  );
};

export default HoveredComponent;
