import { Fragment, Suspense } from "react";
import Header from "../../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";
import LoadingScreen from "../../components/Loaders/LoadingScreen";

const MainPage = () => {
  return (
    <Fragment>
      <Header />
      <main>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </Fragment>
  );
};

export default MainPage;
