import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/home/Home";
import MainPage from "../pages/main/MainPage";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    children: [
      {
        index: true, // This is the default route
        element: <Home />,
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
]);

export default router;
