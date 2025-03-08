import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ErrorBoundary from "../error/ErrorBoundary";
import { useUserStore } from "../../store/user.store";
import { useGetUserDetails } from "../../api/user/user.service";
import { RefObject, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { VerticalScrollType } from "../../types";
import { BottomGradient } from "../../components/Gradients";
import useVerticalScrollable from "../../hooks/useVerticalScrollable";

const Main = () => {
  const [showGradient, containerRef] = useVerticalScrollable();
  const { isAuthenticated, setUser } = useUserStore();
  const { data } = useGetUserDetails();
  useEffect(() => {
    if (data && !isAuthenticated) {
      setUser(data?.user ?? null);
    }
  }, [data, isAuthenticated, setUser]);

  return (
    <ErrorBoundary>
      <div className="max-h-dvh min-h-dvh max-w-full min-w-full w-dvw h-dvh flex gap-3 overflow-hidden p-2">
        <Sidebar />
        <div className="w-full h-full relative">
          <div
            ref={containerRef as RefObject<HTMLDivElement>}
            className="grow max-w-full h-full overflow-y-scroll rounded-lg border relative"
          >
            <div className="bg-primary-inverted w-full sticky top-0 z-50">
              <Navbar />
            </div>
            <div className="w-full">
              <main className="w-full py-3">
                <Outlet />
              </main>
              <Footer />
            </div>
          </div>
          {(showGradient as VerticalScrollType).bottom && (
            <BottomGradient className="!w-full h-8 from-secondary-inverted rounded-b-lg z-[100]" />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Main;
