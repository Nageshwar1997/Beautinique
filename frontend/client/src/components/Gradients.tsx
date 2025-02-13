import { IconProps } from "../icons";

export const TopGradient = ({ className }: IconProps) => {
  return (
    <div
      className={`w-full md:w-1/2 absolute top-0 pointer-events-none h-24 z-[1] bg-gradient-to-b from-primary-inverted to-transparent ${className}`}
    />
  );
};

export const BottomGradient = ({ className }: IconProps) => {
  return (
    <div
      className={`w-full md:w-1/2 absolute bottom-0 pointer-events-none h-24 z-[1] bg-gradient-to-t from-primary-inverted to-transparent ${className}`}
    />
  );
};
