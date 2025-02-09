import { Fragment, Suspense } from "react";
import Navbar from "../../components/header/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import LoadingScreen from "../../components/Loaders/LoadingScreen";

const MainPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<LoadingScreen />}>
        <div className="w-dvw h-dvh min-w-dvw min-h-dvh bg-primary text-primary-inverted">
          <Navbar />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </Suspense>
    </Fragment>
  );
};

export default MainPage;
