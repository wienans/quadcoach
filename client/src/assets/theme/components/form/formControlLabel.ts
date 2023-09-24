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
import { ComponentsOverrides, ComponentsProps, ComponentsVariants, Theme, SimplePaletteColorOptions } from "@mui/material";

// Soft UI Dashboard React base styles
import colors from "../../base/colors";
import typography from "../../base/typography";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { dark } = colors;
const { size, fontWeightBold } = typography;

const formControlLabel: {
  defaultProps?: ComponentsProps['MuiFormControlLabel'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiFormControlLabel'];
  variants?: ComponentsVariants['MuiFormControlLabel'];
} = {
  styleOverrides: {
    root: {
      display: "block",
      minHeight: pxToRem(24),
      marginBottom: pxToRem(2),
    },

    label: {
      display: "inline-block",
      fontSize: size!.sm,
      fontWeight: fontWeightBold,
      color: (dark as SimplePaletteColorOptions).main,
      lineHeight: 1,
      transform: `translateY(${pxToRem(1)})`,
      marginLeft: pxToRem(4),

      "&.Mui-disabled": {
        color: (dark as SimplePaletteColorOptions).main,
      },
    },
  },
};

export default formControlLabel;
