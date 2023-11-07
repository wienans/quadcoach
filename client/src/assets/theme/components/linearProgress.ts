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
  SimplePaletteColorOptions,
  Theme,
} from "@mui/material";

// Soft UI Dashboard React base styles
import borders from "../base/borders";
import colors from "../base/colors";

// Soft UI Dashboard React helper functions
import pxToRem from "../functions/pxToRem";

const { borderRadius } = borders;
const { light } = colors;

const linearProgress: {
  defaultProps?: ComponentsProps["MuiLinearProgress"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiLinearProgress"];
  variants?: ComponentsVariants["MuiLinearProgress"];
} = {
  styleOverrides: {
    root: {
      height: pxToRem(3),
      borderRadius: borderRadius.md,
      overflow: "visible",
      position: "relative",
    },

    colorPrimary: {
      backgroundColor: (light as SimplePaletteColorOptions).main,
    },

    colorSecondary: {
      backgroundColor: (light as SimplePaletteColorOptions).main,
    },

    bar: {
      height: pxToRem(6),
      borderRadius: borderRadius.sm,
      position: "absolute",
      transform: `translate(0, ${pxToRem(-1.5)}) !important`,
      transition: "width 0.6s ease !important",
    },
  },
};

export default linearProgress;
