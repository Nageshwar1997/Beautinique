import { Fragment, Suspense } from "react";
import Header from "../../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import LoadingScreen from "../../components/Loaders/LoadingScreen";

const MainPage = () => {
  return (
    <Fragment>
      <Suspense fallback={<LoadingScreen />}>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </Suspense>
    </Fragment>
  );
};

export default MainPage;
