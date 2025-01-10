import { Outlet } from "react-router-dom";
import DarkMode from "./components/DarkMode";

function App() {
  return (
    <div className="bg-primary relative">
      <div className="absolute top-4 right-4 bg-red-500 p-4 z-10 rounded-full">
        <DarkMode />
      </div>
      <Outlet />
    </div>
  );
}

export default App;
