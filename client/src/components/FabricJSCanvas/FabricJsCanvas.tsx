import { fabric } from "fabric";
import { useState, useEffect, useRef, MutableRefObject } from "react";

export type FabricJsCanvasProps = {
  initialWidth: number;
  initialHight: number;
  backgroundImage?: string;
  containerRef: MutableRefObject<null>;
};
// let canvas: fabric.Canvas;
const FabricJsCanvas = ({
  initialWidth,
  initialHight,
  backgroundImage,
  containerRef,
}: FabricJsCanvasProps): JSX.Element => {
  const [dimensions, setDimensions] = useState({
    height: initialHight,
    width: initialWidth,
  });
  const initCanvas = () => {
    console.debug("init");
    return new fabric.Canvas("canvas", {
      isDrawingMode: true,
      height: initialHight,
      width: initialWidth,
      backgroundImage: backgroundImage,
    });
  };
  const [canvas, setCanvas] = useState("");

  useEffect(() => {
    setCanvas(initCanvas());
  }, []);

  useEffect(() => {
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
        setDimensions(dim);
        canvas.setDimensions(dim);
        canvas.setZoom(scaleRatio);
      }
    };
    // handleResize();
    window.addEventListener("resize", handleResize);
  }, [canvas, containerRef, backgroundImage, initialHight, initialWidth]);

  return (
    <div>
      <canvas id={"canvas"} />
    </div>
  );
};

export default FabricJsCanvas;
