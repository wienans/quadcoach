import React, { createContext, useState } from "react";

interface FooterContextType {
  isFooterOpen: boolean;
  toggleFooter: () => void;
}

// The context and its provider intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
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
