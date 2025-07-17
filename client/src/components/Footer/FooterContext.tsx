import React, { createContext, useState } from "react";

interface FooterContextType {
  isFooterOpen: boolean;
  toggleFooter: () => void;
}

export const FooterContext = createContext<FooterContextType | undefined>(
  undefined,
);

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
