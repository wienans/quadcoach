import * as fabric from "fabric";
import { getUuid } from "./TacticBoardFabricJsContext/fabricTypes";

/**
 * Minimal shape required to animate a target into place. Kept intentionally
 * narrow so serialized page objects (TacticBoardObject) satisfy it without
 * depending on the live fabric instance.
 */
export type AnimationTarget = {
  left?: number;
  top?: number;
};

const ANIMATION_DURATION_MS = 1000;

/**
 * Animates every canvas object whose `uuid` maps to a target in `targetByUuid`
 * from its current position toward the target's `left`/`top` (one fabric
 * animation per changed axis, 1s duration), redrawing the canvas on each frame.
 *
 * `onComplete` is invoked exactly once:
 *   - immediately, if nothing needs to animate, or
 *   - after every started animation has reported completion.
 *
 * This collapses the per-page transition dance that used to be duplicated
 * across every tactic board viewer.
 */
export const animateObjectsToTargets = (
  objects: fabric.Object[],
  targetByUuid: Map<string, AnimationTarget>,
  canvas: fabric.Canvas | null,
  onComplete: () => void,
): void => {
  const requestRenderAll = (): void => {
    canvas?.requestRenderAll();
  };

  let pendingAnimations = 0;
  let didComplete = false;

  const completeOnce = (): void => {
    if (didComplete) return;
    didComplete = true;
    onComplete();
  };

  const onOneAnimationComplete = (): void => {
    pendingAnimations -= 1;
    if (pendingAnimations <= 0) {
      completeOnce();
    }
  };

  objects.forEach((obj) => {
    const objUuid = getUuid(obj);
    if (typeof objUuid !== "string") return;

    const targetObject = targetByUuid.get(objUuid);
    if (!targetObject || !canvas) return;

    const targetLeft = targetObject.left;
    const targetTop = targetObject.top;

    if (typeof targetLeft !== "number" || typeof targetTop !== "number") {
      return;
    }

    const currentLeft = obj.left ?? 0;
    const currentTop = obj.top ?? 0;

    const shouldAnimateLeft = targetLeft !== currentLeft;
    const shouldAnimateTop = targetTop !== currentTop;

    if (!shouldAnimateLeft && !shouldAnimateTop) return;

    if (shouldAnimateLeft) {
      pendingAnimations += 1;
      obj.animate(
        { left: targetLeft },
        {
          onChange: requestRenderAll,
          duration: ANIMATION_DURATION_MS,
          onComplete: onOneAnimationComplete,
        },
      );
    }

    if (shouldAnimateTop) {
      pendingAnimations += 1;
      obj.animate(
        { top: targetTop },
        {
          onChange: requestRenderAll,
          duration: ANIMATION_DURATION_MS,
          onComplete: onOneAnimationComplete,
        },
      );
    }
  });

  if (pendingAnimations === 0) {
    completeOnce();
  }
};
