import { fabric } from "fabric";
import { useEffect, useRef, RefObject } from "react";
import { useFabricJs } from "../FabricJsContext";
export type FabricJsCanvasProps = {
  initialWidth: number;
  initialHight: number;
  backgroundImage?: string;
  containerRef: RefObject<HTMLDivElement>;
  initialCanvas?: object;
};

const FabricJsCanvas = ({
  initialWidth,
  initialHight,
  backgroundImage,
  containerRef,
  initialCanvas,
}: FabricJsCanvasProps): JSX.Element => {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const { setCanvas } = useFabricJs();

  useEffect(() => {
    const canvasInstance = new fabric.Canvas("fabricCanvas", {
      width: initialWidth,
      height: initialHight,
      allowTouchScrolling: true,
      selection: false,
    });
    console.debug("USEEFFEKT");

    // Save canvas reference to the local ref
    canvasRef.current = canvasInstance;

    // Update the context with the current canvas instance
    setCanvas(canvasInstance);

    const handleResize = () => {
      console.debug("Resize");
      // Calculate the Correct Scaling
      if (containerRef.current) {
        const ratio = initialWidth / initialHight;
        const width = containerRef.current.offsetWidth - 20;
        const top =
          containerRef.current.getBoundingClientRect().top < 0
            ? 0
            : containerRef.current.getBoundingClientRect().top;
        const height = window.innerHeight - top - 50;
        const calculatedWidth = ratio * height;
        let calcHeight = 0;
        let calcWidth = 0;
        if (calculatedWidth > width) {
          calcHeight = width / ratio;
          calcWidth = width;
        } else {
          calcHeight = height;
          calcWidth = calculatedWidth;
        }
        // Make the numbers Even
        if (calcWidth % 2) {
          calcWidth = calcWidth + 1;
        }
        if (calcHeight % 2) {
          calcHeight = calcHeight + 1;
        }
        const dim = {
          width: calcWidth,
          height: calcHeight,
        };
        // Set the Dimensions
        canvasInstance.setDimensions(dim);
        canvasInstance.setZoom(calcWidth / initialWidth);
        canvasInstance.renderAll();
      }
    };
    const init = () => {
      handleResize();
    };

    // Initialize Background and resize
    init();

    // Add the Event Listeners
    window.addEventListener("resize", handleResize, false);

    return () => {
      canvasInstance.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    initialCanvas,
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
