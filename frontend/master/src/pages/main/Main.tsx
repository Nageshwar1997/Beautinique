import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ErrorBoundary from "../error/ErrorBoundary";
import { useUserStore } from "../../store/user.store";
import { useGetUserDetails } from "../../api/user/user.service";
import { useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";

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
      <div className="w-dvw h-dvh flex">
        <Sidebar />
        <div className="w-full h-full flex flex-col gap-3 pt-16 pl-[250px] overflow-y-scroll">
          <Navbar />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Main;
