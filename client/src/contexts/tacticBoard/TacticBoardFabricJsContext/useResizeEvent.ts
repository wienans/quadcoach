import { MutableRefObject, useCallback, useRef } from "react";
import {
  Workarea,
  WorkareaLayout,
  // isExtendedFabricObject
} from "./types";
import { workareaId } from "./useWorkarea";

export const useContainerResizeEvent = (
  container: MutableRefObject<HTMLDivElement | null>,
  canvas: MutableRefObject<fabric.Canvas | null>,
  workarea: MutableRefObject<Workarea | null>,
) => {
  const containerResizeObserverRef = useRef<ResizeObserver | null>(null);

  const resize = useCallback(
    (nextWidth: number, nextHeight: number): void => {
      if (!canvas.current) return;

      canvas.current.setWidth(nextWidth).setHeight(nextHeight);

      if (
        !workarea.current ||
        workarea.current.width == null ||
        workarea.current.height == null
      )
        return;

      const diffWidth = nextWidth / 2 - workarea.current.width / 2;
      const diffHeight = nextHeight / 2 - workarea.current.height / 2;

      if (workarea.current.layout === WorkareaLayout.LANDSCAPE) {
        const tmpHeight = workarea.current.width;
        workarea.current.width = workarea.current.height;
        workarea.current.height = tmpHeight;
      }

      canvas.current.centerObject(workarea.current);
      workarea.current.setCoords();

      // TODO: if grid implemented
      //   if (gridOption?.enabled) {
      //     return;
      //   }

      canvas.current.getObjects().forEach((obj: fabric.Object) => {
        if (obj.id === workareaId || obj.left == null || obj.top == null)
          return;

        const left = obj.left + diffWidth;
        const top = obj.top + diffHeight;
        obj.set({
          left,
          top,
        });
        obj.setCoords();
      });
      canvas.current.requestRenderAll();
    },
    [canvas, workarea],
  );

  const initializeContainerResizeObserver = useCallback(() => {
    if (!container.current) return;
    containerResizeObserverRef.current = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        if (!canvas.current) return;
        const { width = 0, height = 0 } = entries[0]?.contentRect || {};
        resize(width, height);
      },
    );

    containerResizeObserverRef.current.observe(container.current);
  }, [canvas, container, resize]);

  return {
    containerResizeObserverRef,
    initializeContainerResizeObserver,
  };
};
