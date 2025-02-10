import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";
import { ThemeTypes } from "../types";

function DarkMode() {
  const storedTheme = (localStorage.getItem("theme") as ThemeTypes) || "dark";

  const [theme, setTheme] = useState<ThemeTypes>(storedTheme);

  useEffect(() => {
    // Update the `theme` attribute on the body
    document.body.setAttribute("theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div onClick={toggleTheme}>
      {theme === "dark" ? (
        <SunIcon className="[&>path]:stroke-tertiary-inverted" />
      ) : (
        <MoonIcon className="[&>path]:stroke-tertiary-inverted" />
      )}
    </div>
  );
}

export default DarkMode;
