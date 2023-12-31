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

// Soft UI Dashboard React helper functions
import pxToRem from "../functions/pxToRem";

// Soft UI Dashboard React base styles
import colors from "../base/colors";
import boxShadows from "../base/boxShadows";
import borders from "../base/borders";

const { transparent } = colors;
const { lg } = boxShadows;
const { borderRadius } = borders;

const popover: {
  defaultProps?: ComponentsProps["MuiPopover"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiPopover"];
  variants?: ComponentsVariants["MuiPopover"];
} = {
  styleOverrides: {
    paper: {
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
      boxShadow: lg,
      padding: pxToRem(8),
      borderRadius: borderRadius.lg,
    },
  },
};

export default popover;
