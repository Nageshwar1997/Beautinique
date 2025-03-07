import { Outlet } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ErrorBoundary from "../error/ErrorBoundary";

const Main = () => {
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
