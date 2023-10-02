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
import boxShadows from "../../base/boxShadows";
import typography from "../../base/typography";
import colors from "../../base/colors";
import borders from "../../base/borders";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { lg } = boxShadows;
const { size } = typography;
const { text, white } = colors;
const { borderRadius } = borders;

const menu: {
  defaultProps?: ComponentsProps['MuiMenu'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiMenu'];
  variants?: ComponentsVariants['MuiMenu'];
} = {
  defaultProps: {
    disableAutoFocusItem: true,
  },

  styleOverrides: {
    paper: {
      minWidth: pxToRem(160),
      boxShadow: lg,
      padding: `${pxToRem(16)} ${pxToRem(8)}`,
      fontSize: size!.sm,
      color: text!.main,
      textAlign: "left",
      backgroundColor: `${(white as SimplePaletteColorOptions).main} !important`,
      borderRadius: borderRadius.md,
    },
  },
};

export default menu;
