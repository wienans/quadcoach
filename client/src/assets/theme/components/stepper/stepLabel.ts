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
import typography from "../../base/typography";
import colors from "../../base/colors";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { size, fontWeightRegular } = typography;
const { grey, dark, secondary } = colors;

const stepLabel: {
  defaultProps?: ComponentsProps["MuiStepLabel"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiStepLabel"];
  variants?: ComponentsVariants["MuiStepLabel"];
} = {
  styleOverrides: {
    label: {
      marginTop: `${pxToRem(8)} !important`,
      fontWeight: fontWeightRegular,
      fontSize: size!.md,
      color: grey![300],

      "&.Mui-active": {
        fontWeight: `${fontWeightRegular} !important`,
        color: `${(dark as SimplePaletteColorOptions).main} !important`,
      },

      "&.Mui-completed": {
        fontWeight: `${fontWeightRegular} !important`,
        color: `${(secondary as SimplePaletteColorOptions).main} !important`,
      },
    },
  },
};

export default stepLabel;
