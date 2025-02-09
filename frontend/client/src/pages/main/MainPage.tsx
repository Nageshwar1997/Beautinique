import { Fragment, Suspense } from "react";
import Navbar from "../../components/header/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import LoadingScreen from "../../components/Loaders/LoadingScreen";

const MainPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<LoadingScreen />}>
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Footer />
      </Suspense>
    </Fragment>
  );
};

export default MainPage;
