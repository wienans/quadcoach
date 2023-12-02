import "./translations";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import { SoftTypography, SoftInput, SoftButton } from "../../components";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticsBoard");
  useUpdateBreadcrumbs(t("TacticsBoard:titel"));

  const { editor, onReady } = useFabricJSEditor();

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.setHeight(686);
    editor.canvas.setWidth(1220);
    editor.canvas.setBackgroundImage(
      "/full-court_inkscape.svg",
      editor.canvas.renderAll.bind(editor.canvas),
    );
    editor.canvas.renderAll();
  }, [editor?.canvas.backgroundImage]);

  return (
    <p>
      <SoftTypography variant="h3">{t("TacticsBoard:titel")}</SoftTypography>
      <FabricJSCanvas className="sample-canvas" onReady={onReady} />
    </p>
  );
};

export default TacticsBoard;
