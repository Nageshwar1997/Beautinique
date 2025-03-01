import { Outlet } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ErrorBoundary from "../error/ErrorBoundary";
import { useUserStore } from "../../store/user.store";
import { useGetUserDetails } from "../../api/user/user.service";
import { useEffect } from "react";

const Main = () => {
  const { isAuthenticated, setUser } = useUserStore();
  const { data } = useGetUserDetails();
  useEffect(() => {
    if (data && !isAuthenticated) {
      setUser(data?.user ?? null);
    }
  }, [data, isAuthenticated, setUser]);

  return (
    <ErrorBoundary>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ErrorBoundary>
  );
};

export default Main;
