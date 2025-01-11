import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Register from "../pages/auth/register/Register";
import WithHeaderFooter from "../components/WithHeaderFooter";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <WithHeaderFooter children={<Home />} />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

export default router;
