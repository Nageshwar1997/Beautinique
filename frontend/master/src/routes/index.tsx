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
import BlogsAndVideos from "../pages/blogs_and_videos/BlogsAndVideos";
import Calendar from "../pages/calendar/Calendar";
import ChatAndMessages from "../pages/chat_and_messages/ChatAndMessages";
import CustomerSupport from "../pages/customer_support/CustomerSupport";
import MarketingAndAds from "../pages/marketing_and_ads/MarketingAndAds";
import Orders from "../pages/orders/Orders";
import Products from "../pages/products/Products";
import RefundsAndReturns from "../pages/refunds_and_returns/RefundsAndReturns";
import ReviewsAndRatings from "../pages/reviews_and_ratings/ReviewsAndRatings";
import SalesReports from "../pages/sales_reports/SalesReports";
import Settings from "../pages/settings/Settings";
import Team from "../pages/team/Team";
import Transactions from "../pages/transactions/Transactions";
import Users from "../pages/users/Users";
import Vendors from "../pages/vendors/Vendors";
import UploadBlog from "../pages/blogs_and_videos/blog/UploadBlog";
import EditBlog from "../pages/blogs_and_videos/blog/EditBlog";
import ViewBlog from "../pages/blogs_and_videos/blog/ViewBlog";
import AllBlogsAndVideos from "../pages/blogs_and_videos/blog/all_blogs_and_videos/AllBlogsAndVideos";
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
      {
        path: "blogs_and_videos",
        element: <BlogsAndVideos />,
        children: [
          {
            index: true,
            element: <AllBlogsAndVideos />,
          },
          {
            path: "upload_blog",
            element: <UploadBlog />,
          },
          {
            path: "edit_blog",
            element: <EditBlog />,
          },
          {
            path: "view_blog",
            element: <ViewBlog />,
          },
        ],
      },
      {
        path: "calendar",
        element: <Calendar />,
      },
      {
        path: "chat_and_messages",
        element: <ChatAndMessages />,
      },
      {
        path: "customer_support",
        element: <CustomerSupport />,
      },
      {
        path: "marketing_and_ads",
        element: <MarketingAndAds />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "refunds_and_returns",
        element: <RefundsAndReturns />,
      },
      {
        path: "reviews_and_ratings",
        element: <ReviewsAndRatings />,
      },
      {
        path: "sales_reports",
        element: <SalesReports />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "team",
        element: <Team />,
      },
      {
        path: "transactions",
        element: <Transactions />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "vendors",
        element: <Vendors />,
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
