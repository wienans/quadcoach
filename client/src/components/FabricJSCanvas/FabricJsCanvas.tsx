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
} from "react";

export type FabricJsCanvasProps = {
  initialWidth: number;
  initialHight: number;
  backgroundImage?: string;
  containerRef: RefObject<HTMLDivElement>;
  visibleObject: fabric.Rect;
};
export type FabricJSCanvasRef = {
  getCanvas: () => fabric.Canvas;
};
// let canvas: fabric.Canvas;
const FabricJsCanvas = forwardRef<FabricJSCanvasRef, FabricJsCanvasProps>(
  (
    {
      initialWidth,
      initialHight,
      backgroundImage,
      containerRef,
      visibleObject,
    },
    ref,
  ): JSX.Element => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useImperativeHandle(
      ref,
      () => {
        return {
          getCanvas() {
            return new fabric.Canvas(canvasRef.current);
          },
        };
      },
      [],
    );
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
      const init = () => {
        if (backgroundImage) {
          canvas.setBackgroundImage(
            backgroundImage,
            canvas.renderAll.bind(canvas),
          );
        }
        // canvas.isDrawingMode = true;
        // canvas.add(visibleObject);
        handleResize();
      };
      init();

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
  },
);

export default FabricJsCanvas;
