import { useEffect, useState } from "react";
// import { DarkModeIcon, LightModeIcon } from "./icons";
import { ThemeTypes } from "../types";

function DarkMode() {
  const storedTheme = (localStorage.getItem("theme") as ThemeTypes) || "light";

  const [theme, setTheme] = useState<ThemeTypes>(storedTheme);

  useEffect(() => {
    // Update the `data-theme` attribute on the body
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div
      className="flex items-center justify-center gap-4 cursor-pointer w-6 h-6"
      onClick={toggleTheme}
    >
      {/* {theme === "dark" ? <LightModeIcon /> : <DarkModeIcon />} */}
      <p className="text-">{theme === "dark" ? "Dark" : "Light"}</p>
    </div>
  );
}

export default DarkMode;
