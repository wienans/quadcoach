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

// Soft UI Dashboard React base styles
import colors from "../../base/colors";
import borders from "../../base/borders";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";
import boxShadow from "../../functions/boxShadow";

const { dark, white } = colors;
const { borderWidth, borderColor } = borders;

const darkSimplePaletteColorOptions = dark as SimplePaletteColorOptions;

const stepIcon: {
  defaultProps?: ComponentsProps["MuiStepIcon"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiStepIcon"];
  variants?: ComponentsVariants["MuiStepIcon"];
} = {
  styleOverrides: {
    root: {
      background: (white as SimplePaletteColorOptions).main,
      fill: (white as SimplePaletteColorOptions).main,
      stroke: (white as SimplePaletteColorOptions).main,
      strokeWidth: pxToRem(10),
      width: pxToRem(13),
      height: pxToRem(13),
      border: `${borderWidth[2]} solid ${borderColor}`,
      borderRadius: "50%",
      zIndex: 99,
      transition: "all 200ms linear",

      "&.Mui-active": {
        background: darkSimplePaletteColorOptions.main,
        fill: darkSimplePaletteColorOptions.main,
        stroke: darkSimplePaletteColorOptions.main,
        borderColor: darkSimplePaletteColorOptions.main,
        boxShadow: boxShadow(
          [0, 0],
          [0, 2],
          darkSimplePaletteColorOptions.main,
          1,
        ),
      },

      "&.Mui-completed": {
        background: darkSimplePaletteColorOptions.main,
        fill: darkSimplePaletteColorOptions.main,
        stroke: darkSimplePaletteColorOptions.main,
        borderColor: darkSimplePaletteColorOptions.main,
        boxShadow: boxShadow(
          [0, 0],
          [0, 2],
          darkSimplePaletteColorOptions.main,
          1,
        ),
      },
    },
  },
};

export default stepIcon;
