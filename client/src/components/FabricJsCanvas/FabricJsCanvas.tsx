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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvas, initCanvas, activeObject, setActiveObject, loadFromJSON } =
    useContext(FabricJsContext);

  useEffect(() => {
    initCanvas(canvasRef.current);
  }, [canvasRef, initCanvas, initialHight, initialWidth]);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    console.debug("USEEFFEKT");

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
        canvas.setDimensions(dim);
        canvas.setZoom(scaleRatio);
        canvas.renderAll();
      }
    };
    // const init = () => {
    //   if (backgroundImage) {
    //     canvas.setBackgroundImage(
    //       backgroundImage,
    //       canvas.renderAll.bind(canvas),
    //     );
    //   }
    //   // canvas.isDrawingMode = true;
    //   // canvas.add(visibleObject);
    //   handleResize();
    // };
    // init();

    window.addEventListener("resize", handleResize, false);
    return () => {
      canvas.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [
    visibleObject,
    containerRef,
    backgroundImage,
    initialHight,
    initialWidth,
  ]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default FabricJsCanvas;
