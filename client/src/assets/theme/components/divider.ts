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
import { ComponentsOverrides, ComponentsProps, ComponentsVariants, SimplePaletteColorOptions, Theme } from "@mui/material";

// Soft UI Dashboard React base styles
import colors from "../base/colors";

// Soft UI Dashboard React helper functions
import rgba from "../functions/rgba";
import pxToRem from "../functions/pxToRem";

const { dark, transparent, white } = colors;
const transparentSimplePaletteColorOptions = transparent as SimplePaletteColorOptions
const whiteSimplePaletteColorOptions = white as SimplePaletteColorOptions
const darkSimplePaletteColorOptions = dark as SimplePaletteColorOptions

const divider: {
  defaultProps?: ComponentsProps['MuiDivider'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiDivider'];
  variants?: ComponentsVariants['MuiDivider'];
} = {
  styleOverrides: {
    root: {
      backgroundColor: transparentSimplePaletteColorOptions.main,
      backgroundImage: `linear-gradient(to right, ${rgba(darkSimplePaletteColorOptions.main, 0)}, ${rgba(
        darkSimplePaletteColorOptions.main,
        0.5
      )}, ${rgba(darkSimplePaletteColorOptions.main, 0)}) !important`,
      height: pxToRem(1),
      margin: `${pxToRem(16)} 0`,
      borderBottom: "none",
      opacity: 0.25,
    },

    vertical: {
      backgroundColor: transparentSimplePaletteColorOptions.main,
      backgroundImage: `linear-gradient(to bottom, ${rgba(darkSimplePaletteColorOptions.main, 0)}, ${rgba(
        darkSimplePaletteColorOptions.main,
        0.5
      )}, ${rgba(darkSimplePaletteColorOptions.main, 0)}) !important`,
      width: pxToRem(1),
      height: "100%",
      margin: `0 ${pxToRem(16)}`,
      borderRight: "none",
    },

    light: {
      backgroundColor: transparentSimplePaletteColorOptions.main,
      backgroundImage: `linear-gradient(to right, ${rgba(whiteSimplePaletteColorOptions.main, 0)}, ${rgba(
        whiteSimplePaletteColorOptions.main,
        0.5
      )}, ${rgba(whiteSimplePaletteColorOptions.main, 0)}) !important`,

      "&.MuiDivider-vertical": {
        backgroundImage: `linear-gradient(to bottom, ${rgba(whiteSimplePaletteColorOptions.main, 0)}, ${rgba(
          whiteSimplePaletteColorOptions.main,
          0.5
        )}, ${rgba(whiteSimplePaletteColorOptions.main, 0)}) !important`,
      },
    },
  },
};

export default divider;
