import {
  createContext,
  ReactNode,
  FC,
  useCallback,
  useRef,
  MutableRefObject,
  useMemo,
  useContext,
} from "react";
import { TacticBoardCanvasContext } from "../TacticBoardCanvasContext/TacticBoardCanvasContext";
import { useContainerResizeEvent } from "../TacticBoardFabricJsContext/useResizeEvent";

export interface TacticBoardLayoutContextProps {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  setContainerRef: (instance: HTMLDivElement | null) => void;
}

export const TacticBoardLayoutContext = createContext<
  TacticBoardLayoutContextProps | undefined
>(undefined);

const TacticBoardLayoutContextProvider: FC<{
  children: ReactNode;
  heightFirstResizing: boolean;
}> = ({ children, heightFirstResizing }) => {
  const { canvasFabricRef } = useContext(TacticBoardCanvasContext)!;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { initializeContainerResizeObserver } = useContainerResizeEvent(
    containerRef,
    canvasFabricRef,
    heightFirstResizing,
  );

  const setContainerRef = useCallback(
    (instance: HTMLDivElement | null) => {
      containerRef.current = instance;
      initializeContainerResizeObserver();
    },
    [initializeContainerResizeObserver],
  );

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      containerRef,
      setContainerRef,
    }),
    [containerRef, setContainerRef],
  );

  return (
    <TacticBoardLayoutContext.Provider value={contextValue}>
      {children}
    </TacticBoardLayoutContext.Provider>
  );
};

export default TacticBoardLayoutContextProvider;
