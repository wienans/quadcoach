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
import borders from "../../base/borders";
import colors from "../../base/colors";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { borderWidth } = borders;
const { light } = colors;

const tableCell: {
  defaultProps?: ComponentsProps["MuiTableCell"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiTableCell"];
  variants?: ComponentsVariants["MuiTableCell"];
} = {
  styleOverrides: {
    root: {
      padding: `${pxToRem(12)} ${pxToRem(16)}`,
      borderBottom: `${borderWidth[1]} solid ${
        (light as SimplePaletteColorOptions).main
      }`,
    },
  },
};

export default tableCell;
