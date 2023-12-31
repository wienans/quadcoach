/**
=========================================================
* Soft UI Dashboard React - v3.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Theme,
  SimplePaletteColorOptions,
} from "@mui/material";

// @mui material components
import Fade from "@mui/material/Fade";

// Soft UI Dashboard React base styles
import colors from "../base/colors";
import typography from "../base/typography";
import borders from "../base/borders";

// Soft UI Dashboard React helper functions
import pxToRem from "../functions/pxToRem";

const { black, light } = colors;
const { size, fontWeightRegular } = typography;
const { borderRadius } = borders;

const tooltip: {
  defaultProps?: ComponentsProps["MuiTooltip"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiTooltip"];
  variants?: ComponentsVariants["MuiTooltip"];
} = {
  defaultProps: {
    arrow: true,
    TransitionComponent: Fade,
  },

  styleOverrides: {
    tooltip: {
      maxWidth: pxToRem(200),
      backgroundColor: (black as SimplePaletteColorOptions).main,
      color: (light as SimplePaletteColorOptions).main,
      fontSize: size!.sm,
      fontWeight: fontWeightRegular,
      textAlign: "center",
      borderRadius: borderRadius.md,
      opacity: 0.7,
      padding: `${pxToRem(5)} ${pxToRem(8)} ${pxToRem(4)}`,
    },

    arrow: {
      color: (black as SimplePaletteColorOptions).main,
    },
  },
};

export default tooltip;
