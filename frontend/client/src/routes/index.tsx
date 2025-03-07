import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load route components
const Main = lazy(() => import("../pages/main/Main"));

import Home from "../pages/home/Home";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import NotFound from "../pages/error/NotFound";
import SomethingWentWrong from "../pages/error/SomethingWentWrong";
import LoadingPage from "../components/LoadingPage";
// import { useUserStore } from "../store/user.store";

// const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated, logout } = useUserStore();
//   if (!isAuthenticated) {
//     logout();
//     return <Navigate to="/login" />;
//   }
//   return children;
// };

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingPage />}>
        <Main />
      </Suspense>
    ),
    children: [
      {
        index: true,
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
