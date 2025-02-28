import Spline from "@splinetool/react-spline";
import Branding from "../../../components/Branding";

const AuthRobot = () => {
  return (
    <div
      className="w-1/2 max-h-dvh hidden relative lg:block rounded-2xl text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(270deg, var(--primary-inverted) 1%, var(--blue-crayola-c) 40%, #001B99 100%)",
      }}
    >
      <div className="w-full absolute top-[8vh] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
          Welcome to Beautinique
        </h1>
        <h2 className="text-base md:text-lg lg:text-xl">
          Become a part of our community
        </h2>
        <Branding type="light" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center">
        <Spline
          scene="https://prod.spline.design/EDAPwzBU58Csa1Gc/scene.splinecode"
          className="z-20 bg-transparent"
        />
      </div>
    </div>
  );
};

export default AuthRobot;
