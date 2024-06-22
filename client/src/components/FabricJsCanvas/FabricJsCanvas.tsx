import { fabric } from "fabric";
import { useEffect, useRef, RefObject, useCallback } from "react";
import { useTacticBoardFabricJs } from "../../hooks";
import { Box } from "@mui/material";
export type FabricJsCanvasProps = {
  initialWidth: number;
  initialHight: number;
  backgroundImage?: string;
  // initialCanvas?: object;
};

const FabricJsCanvas = ({
  initialWidth,
  initialHight,
  backgroundImage,
}: FabricJsCanvasProps): JSX.Element => {
  // const localCanvasRef = useRef<HTMLCanvasElement>(null);
  // const localContainerRef = useRef<HTMLDivElement>(null);
  const { setCanvasRef, setContainerRef } = useTacticBoardFabricJs();

  // useEffect(() => {
  //   const canvasInstance = new fabric.Canvas("fabricCanvas", {
  //     width: initialWidth,
  //     height: initialHight,
  //     allowTouchScrolling: true,
  //     selection: false,
  //   });
  //   console.debug("USEEFFEKT");

  //   // Save canvas reference to the local ref
  //   canvasRef.current = canvasInstance;

  //   // Update the context with the current canvas instance
  //   setCanvas(canvasInstance);

  //   const handleResize = () => {
  //     console.debug("Resize");
  //     // Calculate the Correct Scaling
  //     if (containerRef.current) {
  //       const ratio = initialWidth / initialHight;
  //       const width = containerRef.current.offsetWidth - 20;
  //       const top =
  //         containerRef.current.getBoundingClientRect().top < 0
  //           ? 0
  //           : containerRef.current.getBoundingClientRect().top;
  //       const height = window.innerHeight - top - 50;
  //       const calculatedWidth = ratio * height;
  //       let calcHeight = 0;
  //       let calcWidth = 0;
  //       if (calculatedWidth > width) {
  //         calcHeight = width / ratio;
  //         calcWidth = width;
  //       } else {
  //         calcHeight = height;
  //         calcWidth = calculatedWidth;
  //       }
  //       // Make the numbers Even
  //       if (calcWidth % 2) {
  //         calcWidth = calcWidth + 1;
  //       }
  //       if (calcHeight % 2) {
  //         calcHeight = calcHeight + 1;
  //       }
  //       const dim = {
  //         width: calcWidth,
  //         height: calcHeight,
  //       };
  //       // Set the Dimensions
  //       canvasInstance.setDimensions(dim);
  //       canvasInstance.setZoom(calcWidth / initialWidth);
  //       canvasInstance.renderAll();
  //     }
  //   };
  //   const init = () => {
  //     handleResize();
  //   };

  //   // Initialize Background and resize
  //   init();

  //   // Add the Event Listeners
  //   window.addEventListener("resize", handleResize, false);

  //   return () => {
  //     canvasInstance.dispose();
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [
  //   initialCanvas,
  //   containerRef,
  //   backgroundImage,
  //   initialHight,
  //   initialWidth,
  //   setCanvas,
  // ]);
  // const handleRef = (instance: HTMLCanvasElement | null) => {
  //   debugger;
  //   const canvasInstance = new fabric.Canvas(instance, {
  //     width: initialWidth,
  //     height: initialHight,
  //     allowTouchScrolling: true,
  //     selection: false,
  //   });

  //   // Update the context with the current canvas instance
  //   // setCanvas(canvasInstance);
  //   return () => {
  //     canvasInstance.dispose();
  //   };
  // };

  // const handleResize = useCallback(() => {
  //   if (!containerRef.current || !canvasFabric) return;
  //   debugger;
  //   const ratio = initialWidth / initialHight;
  //   const width = containerRef.current.offsetWidth - 20;
  //   const top =
  //     containerRef.current.getBoundingClientRect().top < 0
  //       ? 0
  //       : containerRef.current.getBoundingClientRect().top;
  //   const height = window.innerHeight - top - 50;
  //   const calculatedWidth = ratio * height;
  //   let calcHeight = 0;
  //   let calcWidth = 0;
  //   if (calculatedWidth > width) {
  //     calcHeight = width / ratio;
  //     calcWidth = width;
  //   } else {
  //     calcHeight = height;
  //     calcWidth = calculatedWidth;
  //   }
  //   // Make the numbers Even
  //   if (calcWidth % 2) {
  //     calcWidth = calcWidth + 1;
  //   }
  //   if (calcHeight % 2) {
  //     calcHeight = calcHeight + 1;
  //   }
  //   const dim = {
  //     width: calcWidth,
  //     height: calcHeight,
  //   };
  //   // Set the Dimensions
  //   canvasFabric.setDimensions(dim);
  //   canvasFabric.setZoom(calcWidth / initialWidth);
  //   canvasFabric.renderAll();
  // }, [canvasFabric, containerRef, initialHight, initialWidth]);

  // const init = useCallback(() => {
  //   handleResize();
  // }, [handleResize]);

  // useEffect(() => {
  //   const canvasInstance = new fabric.Canvas(canvas, {
  //     width: initialWidth,
  //     height: initialHight,
  //     allowTouchScrolling: true,
  //     selection: false,
  //   });

  //   // Update the context with the current canvas instance
  //   setCanvasFabric(canvasInstance);

  //   // Initialize Background and resize
  //   init();

  //   return () => {
  //     canvasInstance.dispose();
  //   };
  // }, [canvas, init, initialHight, initialWidth, setCanvasFabric]);

  // useEffect(() => {
  //   if (!canvasFabric) return;
  //   debugger;
  //   init();
  // }, [init, canvasFabric]);

  // useEffect(() => {
  //   const handleResizeEvent = () => {
  //     debugger;
  //     handleResize();
  //   };
  //   // Add the Event Listeners
  //   window.addEventListener("resize", handleResizeEvent, false);

  //   return () => {
  //     window.removeEventListener("resize", handleResizeEvent);
  //   };
  // }, [handleResize]);

  const canvasRefA = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const l = canvasRefA;
    // debugger;
  }, []);

  return (
    <Box
      ref={setContainerRef}
      sx={{
        width: "100%",
        height: "100%",
      }}
    >
      <canvas ref={setCanvasRef} />
    </Box>
  );
};

export default FabricJsCanvas;
