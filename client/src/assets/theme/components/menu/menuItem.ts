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
import colors from "../../base/colors";
import borders from "../../base/borders";
import typography from "../../base/typography";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { light, text, dark } = colors;
const { borderRadius } = borders;
const { size } = typography;

const menuItem: {
  defaultProps?: ComponentsProps["MuiMenuItem"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiMenuItem"];
  variants?: ComponentsVariants["MuiMenuItem"];
} = {
  styleOverrides: {
    root: {
      minWidth: pxToRem(160),
      minHeight: "unset",
      padding: `${pxToRem(4.8)} ${pxToRem(16)}`,
      borderRadius: borderRadius.md,
      fontSize: size!.sm,
      color: text!.main,
      transition: "background-color 300ms ease, color 300ms ease",

      "&:hover, &:focus, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus":
        {
          backgroundColor: (light as SimplePaletteColorOptions).main,
          color: (dark as SimplePaletteColorOptions).main,
        },
    },
  },
};

export default menuItem;
