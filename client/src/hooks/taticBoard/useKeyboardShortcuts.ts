import { useEffect, useCallback } from "react";
import { fabric } from "fabric";
import { useTacticBoardCanvas } from "./useTacticBoardCanvas";

export interface KeyboardShortcutsConfig {
  enableUndo?: boolean;
  enableRedo?: boolean;
  enableDelete?: boolean;
  enableSelectAll?: boolean;
  enableCopy?: boolean;
  enablePaste?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig = {}) => {
  const { undo, redo, removeActiveObjects, getAllObjects, canvasFabricRef } =
    useTacticBoardCanvas();

  const {
    enableUndo = true,
    enableRedo = true,
    enableDelete = true,
    enableSelectAll = true,
    enableCopy = false, // Disabled by default as it needs more implementation
    enablePaste = false, // Disabled by default as it needs more implementation
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const canvas = canvasFabricRef.current;

      if (!canvas) return;

      // Undo: Ctrl/Cmd + Z
      if (enableUndo && isCtrlOrCmd && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if (
        enableRedo &&
        isCtrlOrCmd &&
        ((event.key === "z" && event.shiftKey) || event.key === "y")
      ) {
        event.preventDefault();
        redo();
        return;
      }

      // Delete: Delete or Backspace
      if (
        enableDelete &&
        (event.key === "Delete" || event.key === "Backspace")
      ) {
        event.preventDefault();
        removeActiveObjects();
        return;
      }

      // Select All: Ctrl/Cmd + A
      if (enableSelectAll && isCtrlOrCmd && event.key === "a") {
        event.preventDefault();
        const allObjects = getAllObjects();
        if (allObjects.length > 0) {
          const selection = new fabric.ActiveSelection(allObjects, {
            canvas: canvas,
          });
          canvas.setActiveObject(selection);
          canvas.renderAll();
        }
        return;
      }

      // Escape: Deselect all
      if (event.key === "Escape") {
        event.preventDefault();
        canvas.discardActiveObject();
        canvas.renderAll();
        return;
      }

      // Arrow keys: Move selected objects
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        const activeObject = canvas.getActiveObject();
        if (!activeObject) return;

        event.preventDefault();

        const moveDistance = event.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;

        switch (event.key) {
          case "ArrowUp":
            deltaY = -moveDistance;
            break;
          case "ArrowDown":
            deltaY = moveDistance;
            break;
          case "ArrowLeft":
            deltaX = -moveDistance;
            break;
          case "ArrowRight":
            deltaX = moveDistance;
            break;
        }

        if (activeObject.type === "activeSelection") {
          // Move all objects in selection
          (activeObject as fabric.ActiveSelection).forEachObject((obj) => {
            obj.set({
              left: (obj.left || 0) + deltaX,
              top: (obj.top || 0) + deltaY,
            });
          });
        } else {
          // Move single object
          activeObject.set({
            left: (activeObject.left || 0) + deltaX,
            top: (activeObject.top || 0) + deltaY,
          });
        }

        canvas.renderAll();
        return;
      }

      // TODO: Implement copy/paste functionality
      if (enableCopy && isCtrlOrCmd && event.key === "c") {
        event.preventDefault();
        // Copy functionality would go here
        console.log("Copy shortcut triggered (not implemented)");
        return;
      }

      if (enablePaste && isCtrlOrCmd && event.key === "v") {
        event.preventDefault();
        // Paste functionality would go here
        console.log("Paste shortcut triggered (not implemented)");
        return;
      }
    },
    [
      enableUndo,
      enableRedo,
      enableDelete,
      enableSelectAll,
      enableCopy,
      enablePaste,
      undo,
      redo,
      removeActiveObjects,
      getAllObjects,
      canvasFabricRef,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return some utility functions that components can use
    triggerUndo: undo,
    triggerRedo: redo,
    triggerDelete: removeActiveObjects,
  };
};
