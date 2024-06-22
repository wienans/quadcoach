import { MutableRefObject, useCallback, useRef } from "react";
import { fabric } from "fabric";
import { Workarea, WorkareaLayout, WorkareaOptions } from "./types";

export const workareaId = "workarea";
export const defaultWorkareaOption: Partial<WorkareaOptions> = {
  left: 0,
  top: 0,
  // width: 595,
  // height: 842,
  // workareaWidth: 595,
  // workareaHeight: 842,
  lockScalingX: true,
  lockScalingY: true,
  scaleX: 1,
  scaleY: 1,
  backgroundColor: "#fff",
  hasBorders: false,
  hasControls: false,
  selectable: false,
  lockMovementX: true,
  lockMovementY: true,
  hoverCursor: "default",
  name: "",
  id: workareaId,
  type: "image",
  layout: WorkareaLayout.PORTRAIT,
  // link: { url: "" },
  // isElement: false,
};

export const useWorkarea = (canvas: MutableRefObject<fabric.Canvas | null>) => {
  const workarea = useRef<Workarea | null>(null);

  const initializeWorkarea = useCallback(() => {
    if (!canvas?.current) return;
    // const { width, height } = defaultWorkareaOption;
    // if (width == null || height == null) return;

    const image = new Image(canvas.current.width, canvas.current.height);

    workarea.current = new Workarea(image, {
      id: workareaId,
      layout: WorkareaLayout.PORTRAIT,
      ...defaultWorkareaOption,
      width: canvas.current.width,
      height: canvas.current.height,
    });
    canvas.current.add(workarea.current);
    canvas.current.centerObject(workarea.current);
    canvas.current.renderAll();
  }, [canvas]);

  return {
    workarea,
    initializeWorkarea,
  };
};
