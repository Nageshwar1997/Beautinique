import { navData } from "../data/newData";

const HoveredComponent = ({ index }: { index: number }) => {
  if (index === null || index >= navData.length) {
    return null;
  }

  const Component = navData[index].component;

  return (
    <div className="lg:p-px lg:bg-primary-battleship-davys-gray lg:rounded-xl w-full h-full backdrop-blur-3xl max-w-[1300px] shadow-navbar-card">
      <div className="bg-platinum-black text-secondary lg:w-full lg:p-5 lg:bg-secondary-inverted lg:rounded-xl lg:font-metropolis">
        <Component />
      </div>
    </div>
  );
};

export default HoveredComponent;
