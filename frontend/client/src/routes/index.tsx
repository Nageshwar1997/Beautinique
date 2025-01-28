import { createBrowserRouter } from "react-router-dom";

// import Home from "../pages/home/Home";
import MainPage from "../pages/main/MainPage";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import NotFound from "../pages/error/NotFound";
import SomethingWentWrong from "../pages/error/SomethingWentWrong";
import XYZ from "../pages/home/XYZ";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    children: [
      {
        index: true, // This is the default route
        element: <XYZ />,
      },
    ],
  },
  {
    path: "register",
    element: <Register />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "error",
    element: <SomethingWentWrong />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
