import { ReactNode } from "react";
import Footer from "./footer/Footer";

const WithFooter = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <Footer />
    </>
  );
};

export default WithFooter;
