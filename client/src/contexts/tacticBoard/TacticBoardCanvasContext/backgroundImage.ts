import * as fabric from "fabric";

export const TACTIC_BOARD_SCENE_WIDTH = 1220;
export const TACTIC_BOARD_SCENE_HEIGHT = 686;

export const fitBackgroundImageToScene = (
  image: fabric.FabricImage,
): fabric.FabricImage => {
  const sourceWidth = image.width ?? 0;
  const sourceHeight = image.height ?? 0;

  image.set({
    left: 0,
    top: 0,
    originX: "left",
    originY: "top",
    selectable: false,
    evented: false,
  });

  if (sourceWidth > 0 && sourceHeight > 0) {
    image.scaleX = TACTIC_BOARD_SCENE_WIDTH / sourceWidth;
    image.scaleY = TACTIC_BOARD_SCENE_HEIGHT / sourceHeight;
  }

  image.setCoords();
  return image;
};

export const applyBackgroundImage = (
  canvas: fabric.Canvas,
  image?: fabric.FabricImage,
): void => {
  canvas.backgroundImage = image ? fitBackgroundImageToScene(image) : undefined;
  canvas.requestRenderAll();
};

export const loadBackgroundImage = async (
  canvas: fabric.Canvas,
  src?: string,
): Promise<void> => {
  if (!src) {
    applyBackgroundImage(canvas);
    return;
  }

  const image = await fabric.FabricImage.fromURL(src);
  applyBackgroundImage(canvas, image);
};
