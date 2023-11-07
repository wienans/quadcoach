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
import borders from "../../base/borders";
import colors from "../../base/colors";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";
import linearGradient from "../../functions/linearGradient";

const { borderWidth, borderColor } = borders;
const { transparent, gradients, info } = colors;
const transparentSimplePaletteColorOptions =
  transparent as SimplePaletteColorOptions;

const checkbox: {
  defaultProps?: ComponentsProps["MuiCheckbox"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiCheckbox"];
  variants?: ComponentsVariants["MuiCheckbox"];
} = {
  styleOverrides: {
    root: {
      backgroundPosition: "center",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      width: pxToRem(20),
      height: pxToRem(20),
      marginRight: pxToRem(6),
      padding: 0,
      color: transparentSimplePaletteColorOptions.main,
      border: `${borderWidth[1]} solid ${borderColor}`,
      borderRadius: pxToRem(5.6),
      transition: "all 250ms ease",

      "&:hover": {
        backgroundColor: transparentSimplePaletteColorOptions.main,
      },

      "& .MuiSvgIcon-root": {
        fill: transparentSimplePaletteColorOptions.main,
      },

      "&.Mui-focusVisible": {
        border: `${borderWidth[2]} solid ${
          (info as SimplePaletteColorOptions).main
        } !important`,
      },
    },

    colorPrimary: {
      backgroundColor: transparentSimplePaletteColorOptions.main,

      "&.Mui-checked": {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -1 22 22'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 10l3 3l6-6'/%3e%3c/svg%3e"), ${linearGradient(
          gradients.dark.main,
          gradients.dark.state,
        )}`,
        borderColor: gradients.dark.main,
      },

      "&:hover": {
        backgroundColor: transparentSimplePaletteColorOptions.main,
      },
    },

    colorSecondary: {
      backgroundColor: transparentSimplePaletteColorOptions.main,

      "&.Mui-checked": {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -1 22 22'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 10l3 3l6-6'/%3e%3c/svg%3e"), ${linearGradient(
          gradients.dark.main,
          gradients.dark.state,
        )}`,
        borderColor: gradients.dark.main,
      },

      "&:hover": {
        backgroundColor: transparentSimplePaletteColorOptions.main,
      },
    },
  },
};

export default checkbox;
