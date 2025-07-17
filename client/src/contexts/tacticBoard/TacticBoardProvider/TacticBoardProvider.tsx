import { ReactNode, FC } from "react";
import TacticBoardCanvasContextProvider from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import TacticBoardDrawingContextProvider from "../TacticBoardDrawingContext/TacticBoardDrawingContext";
import TacticBoardLayoutContextProvider from "../TacticBoardLayoutContext/TacticBoardLayoutContext";
import TacticBoardDataContextProvider from "../TacticBoardDataContext/TacticBoardDataContext";

interface TacticBoardProviderProps {
  children: ReactNode;
  heightFirstResizing: boolean;
}

const TacticBoardProvider: FC<TacticBoardProviderProps> = ({ 
  children, 
  heightFirstResizing 
}) => {
  return (
    <TacticBoardCanvasContextProvider>
      <TacticBoardDrawingContextProvider>
        <TacticBoardLayoutContextProvider heightFirstResizing={heightFirstResizing}>
          <TacticBoardDataContextProvider>
            {children}
          </TacticBoardDataContextProvider>
        </TacticBoardLayoutContextProvider>
      </TacticBoardDrawingContextProvider>
    </TacticBoardCanvasContextProvider>
  );
};

export default TacticBoardProvider;