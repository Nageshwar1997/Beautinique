import { IconProps, MoonIcon, SunIcon } from "../icons";
import useThemeStore from "../store/theme.store";

function DarkMode({ className }: IconProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div onClick={toggleTheme} className={`cursor-pointer ${className}`}>
      {theme === "dark" ? (
        <SunIcon className="[&>path]:stroke-tertiary w-5 h-5 md:w-6 md:h-6" />
      ) : (
        <MoonIcon className="[&>path]:stroke-tertiary w-5 h-5 md:w-6 md:h-6" />
      )}
    </div>
  );
}

export default DarkMode;
