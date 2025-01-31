import Spline from "@splinetool/react-spline";
import Branding from "../../../components/Branding";

const AuthRobot = () => {
  return (
    <div className="w-1/2 max-h-dvh hidden relative md:block rounded-2xl text-center bg-[url(./images/auth/bg-gradient.svg)] bg-center bg-cover bg-no-repeat overflow-hidden">
      <div className="w-full absolute top-[10vh] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold">
          Welcome to Beautinique
        </h1>
        <h2 className="text-base md:text-lg lg:text-xl">
          Become a part of our community
        </h2>
        <Branding type="light" />
      </div>
      <div className="relative h-full flex flex-col items-center justify-center">
        <div
          className="w-full h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 rounded-[25px] overflow-hidden animate-pulse mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle 250px at center 60%, rgb(0, 163, 255) 50px, transparent)",
          }}
        />
        <Spline
          scene="https://prod.spline.design/EDAPwzBU58Csa1Gc/scene.splinecode"
          className="z-20"
        />
      </div>
    </div>
  );
};

export default AuthRobot;
