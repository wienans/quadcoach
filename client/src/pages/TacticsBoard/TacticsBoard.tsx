import "./translations";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Grid } from "@mui/material";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import {
  SoftTypography,
  SoftInput,
  SoftButton,
  SoftBox,
  FabricJsCanvas,
  FabricJsContextProvider,
} from "../../components";
import { fabric } from "fabric";
// import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticsBoard");
  useUpdateBreadcrumbs(t("TacticsBoard:titel"));
  const refContainer = useRef<HTMLDivElement>(null);
  const rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: "red",
    width: 20,
    height: 20,
    angle: 45,
  });
  return (
    <div>
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
            <SoftButton onClick={() => {}}>Chaser</SoftButton>

            <SoftButton onClick={() => {}}>Beater</SoftButton>
          </Grid>
          <Grid item xs={4}>
            <SoftButton onClick={() => {}}>Quaffel</SoftButton>
            <SoftButton onClick={() => {}}>Bludger</SoftButton>
          </Grid>
          <Grid item xs={4}>
            <SoftButton onClick={() => {}}>Chaser</SoftButton>
            <SoftButton onClick={() => {}}>Beater</SoftButton>
          </Grid>

          <Grid item xs={12} ref={refContainer}>
            {/* <FabricJsContextProvider>
              <FabricJsCanvas
                initialHight={686}
                initialWidth={1220}
                backgroundImage="./full-court_inkscape.svg"
                containerRef={refContainer}
                visibleObject={rect}
              />
            </FabricJsContextProvider> */}
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default TacticsBoard;
