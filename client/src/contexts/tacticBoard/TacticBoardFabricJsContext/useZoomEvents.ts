import { MutableRefObject, useCallback } from "react";
import { fabric } from "fabric";
import { ZoomSettings } from "./types";

const zoomRatioIncrement = 0.05;

export const useZoomEvents = (
  canvas: MutableRefObject<fabric.Canvas | null>,
  zoomSettings: ZoomSettings,
) => {
  const zoomToPoint = useCallback(
    (point: fabric.Point, zoom: number) => {
      if (!canvas.current) return;
      const { minZoom, maxZoom } = zoomSettings;
      let zoomRatio = zoom;
      if (zoom <= minZoom / 100) {
        zoomRatio = minZoom / 100;
      } else if (zoom >= maxZoom / 100) {
        zoomRatio = maxZoom / 100;
      }
      canvas.current.zoomToPoint(point, zoomRatio);
      canvas.current.requestRenderAll();
    },
    [canvas, zoomSettings],
  );

  const onMouseWheel = useCallback(
    (event: fabric.IEvent<WheelEvent>) => {
      if (!canvas.current) return;
      const delta = event.e.deltaY;
      const zoomRatio =
        canvas.current.getZoom() + (delta > 0 ? 1 : -1) * zoomRatioIncrement;
      zoomToPoint(
        new fabric.Point(
          canvas.current.getWidth() / 2,
          canvas.current.getHeight() / 2,
        ),
        zoomRatio,
      );
      event.e.preventDefault();
      event.e.stopPropagation();
    },
    [canvas, zoomToPoint],
  );

  const initializeZoomEvents = useCallback(() => {
    if (!canvas.current) return;

    canvas.current.on("mouse:wheel", onMouseWheel);
  }, [canvas, onMouseWheel]);

  return {
    initializeZoomEvents,
  };
};
