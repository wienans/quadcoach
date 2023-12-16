import { fabric } from "fabric";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  MutableRefObject,
  RefObject,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import { FabricJsContext } from "..";
import { useFabricJs } from "../FabricJsContext";
export type FabricJsCanvasProps = {
  initialWidth: number;
  initialHight: number;
  backgroundImage?: string;
  containerRef: RefObject<HTMLDivElement>;
  visibleObject: fabric.Rect;
};

const FabricJsCanvas = ({
  initialWidth,
  initialHight,
  backgroundImage,
  containerRef,
  visibleObject,
}: FabricJsCanvasProps): JSX.Element => {
  const canvasRef2 = useRef<fabric.Canvas | null>(null);
  const { setCanvas } = useFabricJs();

  useEffect(() => {
    const canvasInstance = new fabric.Canvas("fabricCanvas", {
      width: initialWidth,
      height: initialHight,
      backgroundImage: backgroundImage,
    });
    console.debug("USEEFFEKT");

    // Save canvas reference to the local ref
    canvasRef2.current = canvasInstance;

    // Update the context with the current canvas instance
    setCanvas(canvasInstance);

    const handleResize = () => {
      console.debug("Resize");
      // Calculate the Correct Scaling
      if (containerRef.current) {
        let scaleRatio = 1.0;
        const width = containerRef.current.offsetWidth;
        if (width >= initialWidth) {
          scaleRatio = 1.0;
        } else {
          scaleRatio = width / initialWidth;
        }
        const dim = {
          width: initialWidth * scaleRatio,
          height: initialHight * scaleRatio,
        };
        canvasInstance.setDimensions(dim);
        canvasInstance.setZoom(scaleRatio);
        canvasInstance.renderAll();
      }
    };

    window.addEventListener("resize", handleResize, false);
    return () => {
      canvasInstance.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    visibleObject,
    containerRef,
    backgroundImage,
    initialHight,
    initialWidth,
    setCanvas,
  ]);

  return (
    <div>
      <canvas id="fabricCanvas" />
    </div>
  );
};

export default FabricJsCanvas;
