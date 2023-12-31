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
} from "@mui/material";

// Soft UI Dashboard React Base Styles
import colors from "../../base/colors";
import borders from "../../base/borders";

// Soft UI Dashboard PRO helper functions
import pxToRem from "../../functions/pxToRem";

declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    large: true;
  }
}

const { inputColors } = colors;
const { borderWidth, borderRadius } = borders;

const input: {
  defaultProps?: ComponentsProps["MuiInput"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiInput"];
  variants?: ComponentsVariants["MuiInput"];
} = {
  styleOverrides: {
    root: {
      display: "flex !important",
      padding: `${pxToRem(8)} ${pxToRem(28)} ${pxToRem(8)} ${pxToRem(
        12,
      )} !important`,
      border: `${borderWidth[1]} solid ${inputColors.borderColor.main}`,
      borderRadius: `${borderRadius.md} !important`,

      "& fieldset": {
        border: "none",
      },
    },

    input: {
      height: pxToRem(22),
      width: "max-content !important",
    },

    inputSizeSmall: {
      height: pxToRem(14),
    },
  },
};

export default input;
