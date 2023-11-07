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

// Soft UI Dashboard React Base Styles
import {
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  SimplePaletteColorOptions,
  Theme,
} from "@mui/material";
import colors from "../base/colors";

const { transparent } = colors;

const iconButton: {
  defaultProps?: ComponentsProps["MuiIconButton"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiIconButton"];
  variants?: ComponentsVariants["MuiIconButton"];
} = {
  styleOverrides: {
    root: {
      "&:hover": {
        backgroundColor: (transparent as SimplePaletteColorOptions).main,
      },
    },
  },
};

export default iconButton;
