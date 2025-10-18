import { MutableRefObject, useCallback, useRef } from "react";

export const useContainerResizeEvent = (
  container: MutableRefObject<HTMLDivElement | null>,
  canvas: MutableRefObject<fabric.Canvas | null>,
  hightFirstResizeing: boolean,
) => {
  const containerResizeObserverRef = useRef<ResizeObserver | null>(null);
  const canvasDefaultWidth = 1220;
  const canvasDefaultHeight = 686;
  const canvasRatio = canvasDefaultWidth / canvasDefaultHeight;

  const resize = useCallback(
    (nextWidth: number, nextHeight: number): void => {
      if (!canvas.current?.getElement()) return;
      const adjustedWidth = nextWidth - 20;
      const adjustedHeight = nextHeight - 10 < 240 ? 160 : nextHeight - 10;
      if (hightFirstResizeing) {
        // Height First Resizing considers Heigth so that it is in frame
        const calculatedWidth = Math.floor(canvasRatio * adjustedHeight);
        let calcHeight = 0;
        let calcWidth = 0;
        if (calculatedWidth > adjustedWidth) {
          calcHeight = Math.floor(adjustedWidth / canvasRatio);
          calcWidth = adjustedWidth;
        } else {
          calcHeight = adjustedHeight;
          calcWidth = calculatedWidth;
        }
        // Make the numbers Even
        if (calcWidth % 2) {
          calcWidth = calcWidth + 1;
        }
        if (calcHeight % 2) {
          calcHeight = calcHeight + 1;
        }
        canvas.current.setWidth(calcWidth).setHeight(calcHeight);
        canvas.current.setZoom(calcWidth / canvasDefaultWidth);
        canvas.current.requestRenderAll();
      } else {
        // Width First Resizing don't consider Height
        const calculatedHeight = Math.floor(adjustedWidth / canvasRatio);
        let calcHeight = 0;
        let calcWidth = 0;
        if (calculatedHeight > canvasDefaultHeight) {
          calcHeight = canvasDefaultHeight;
          calcWidth = canvasDefaultWidth;
        } else {
          calcHeight = calculatedHeight;
          calcWidth = adjustedWidth;
        }

        // Make the numbers Even
        if (calcWidth % 2) {
          calcWidth = calcWidth + 1;
        }
        if (calcHeight % 2) {
          calcHeight = calcHeight + 1;
        }

        canvas.current.setWidth(calcWidth).setHeight(calcHeight);
        canvas.current.setZoom(calcWidth / canvasDefaultWidth);
        canvas.current.requestRenderAll();
      }
    },
    [canvas, canvasRatio, hightFirstResizeing],
  );

  const initializeContainerResizeObserver = useCallback(() => {
    if (!container.current) {
      console.log("ResizeObserver: No container ref");
      return;
    }

    if (!canvas.current) {
      console.log("ResizeObserver: No canvas ref");
      return;
    }

    // Cleanup existing observer
    if (containerResizeObserverRef.current) {
      containerResizeObserverRef.current.disconnect();
    }

    // console.log("ResizeObserver: Initializing observer");
    containerResizeObserverRef.current = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (!canvas.current) {
          console.log("ResizeObserver: Canvas not ready during resize");
          return;
        }
        const { width = 0, height = 0 } = entries[0]?.contentRect || {};
        // console.log("ResizeObserver: Resizing to", width, "x", height);
        resize(width, height);
      },
    );

    containerResizeObserverRef.current.observe(container.current);
  }, [canvas, container, resize]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (containerResizeObserverRef.current) {
      containerResizeObserverRef.current.disconnect();
      containerResizeObserverRef.current = null;
    }
  }, []);

  return {
    containerResizeObserverRef,
    initializeContainerResizeObserver,
    cleanup,
  };
};
