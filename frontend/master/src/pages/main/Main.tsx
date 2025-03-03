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
      <div className="max-h-dvh min-h-dvh max-w-full min-w-full w-dvw h-dvh flex gap-2 overflow-hidden p-2">
        <Sidebar />
        <div className="grow max-w-full h-full overflow-y-scroll">
          <div className="bg-primary-inverted w-full sticky top-0">
            <Navbar />
          </div>
          <div className="w-full p-2">
            <main className="w-full py-2">
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Main;
