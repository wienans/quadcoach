import "./translations";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Grid } from "@mui/material";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  SoftInput,
  SoftButton,
  SoftBox,
} from "../../components";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { Null } from "mdi-material-ui";

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticsBoard");
  useUpdateBreadcrumbs(t("TacticsBoard:titel"));
  const refContainer = useRef();
  const [dimensions, setDimensions] = useState({
    height: 686,
    width: 1220,
  });
  const { editor, onReady } = useFabricJSEditor();
  let scaleRatio = 1;

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
    handleResize();
  }, [editor, editor?.canvas.backgroundImage]);

  const handleResize = () => {
    if (!editor || !fabric) {
      return;
    }
    // Calculate the Correct Scaling
    if (refContainer.current) {
      const width = refContainer.current.offsetWidth;
      if (width >= 1220) {
        scaleRatio = 1.0;
      } else {
        scaleRatio = width / 1220;
      }
      editor.canvas.setDimensions({
        width: editor.canvas.getWidth() * scaleRatio,
        height: editor.canvas.getHeight() * scaleRatio,
      });
      setDimensions({
        width: editor.canvas.getWidth() * scaleRatio,
        height: editor.canvas.getHeight() * scaleRatio,
      });
      editor.canvas.setZoom(scaleRatio);
    }
  };

  return (
    <div ref={refContainer}>
      <SoftBox
        variant="contained"
        shadow="lg"
        opacity={1}
        p={1}
        my={2}
        borderRadius="lg"
      >
        <SoftTypography variant="h3">{t("TacticsBoard:titel")}</SoftTypography>
      </SoftBox>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Chaser
            </SoftButton>

            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Beater
            </SoftButton>
          </Grid>
          <Grid item xs={4}>
            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Quaffel
            </SoftButton>
            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Bludger
            </SoftButton>
          </Grid>
          <Grid item xs={4}>
            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Chaser
            </SoftButton>
            <SoftButton
              onClick={() => {
                if (!editor || !fabric) {
                  return;
                }
                editor.addCircle();
              }}
            >
              Beater
            </SoftButton>
          </Grid>

          <Grid item xs={12}>
            <FabricJSCanvas className="tactics-board" onReady={onReady} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default TacticsBoard;
