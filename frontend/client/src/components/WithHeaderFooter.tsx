import { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

const WithHeaderFooter = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default WithHeaderFooter;
