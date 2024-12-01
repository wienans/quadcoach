import React, { createContext, useContext, useState } from "react";

interface FooterContextType {
  isFooterOpen: boolean;
  toggleFooter: () => void;
}

const FooterContext = createContext<FooterContextType | undefined>(undefined);

export const FooterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isFooterOpen, setIsFooterOpen] = useState(false);

  const toggleFooter = () => {
    setIsFooterOpen(!isFooterOpen);
  };

  return (
    <FooterContext.Provider value={{ isFooterOpen, toggleFooter }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => {
  const context = useContext(FooterContext);
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider");
  }
  return context;
};
