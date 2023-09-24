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
import { ComponentsOverrides, ComponentsProps, ComponentsVariants, Theme } from "@mui/material";

// Soft UI Dashboard React base styles
import borders from "../../base/borders";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { borderRadius } = borders;

const tableHead: {
  defaultProps?: ComponentsProps['MuiTableHead'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiTableHead'];
  variants?: ComponentsVariants['MuiTableHead'];
} = {
  styleOverrides: {
    root: {
      display: "block",
      padding: `${pxToRem(16)} ${pxToRem(16)} 0  ${pxToRem(16)}`,
      borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
    },
  },
};

export default tableHead;
