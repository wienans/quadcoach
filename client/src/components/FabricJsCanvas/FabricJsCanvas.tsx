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
        // Set the Dimensions
        canvasInstance.setDimensions(dim);
        canvasInstance.setZoom(scaleRatio);
        canvasInstance.renderAll();
      }
    };
    const init = () => {
      // Set the Background image
      if (backgroundImage) {
        canvasInstance.setBackgroundImage(
          backgroundImage,
          canvasInstance.renderAll.bind(canvasInstance),
        );
      }
      if (initialCanvas) {
        canvasInstance.loadFromJSON(initialCanvas, () => {
          canvasInstance.renderAll();
        });
      }
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
