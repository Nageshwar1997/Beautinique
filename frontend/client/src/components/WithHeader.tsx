import { ReactNode } from "react";
import Header from "./header/Header";

const WithHeader = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default WithHeader;
