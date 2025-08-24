import { useContext } from "react";
import { FooterContext } from "./FooterContext";

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return context;
};
