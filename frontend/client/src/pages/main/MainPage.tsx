import { Fragment } from "react";
import Header from "../../components/header/Header";
import { Outlet } from "react-router-dom";
import Footer from "../../components/footer/Footer";

const MainPage = () => {
  return (
    <Fragment>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </Fragment>
  );
};

export default MainPage;
