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
import boxShadows from "../../base/boxShadows";
import typography from "../../base/typography";
import colors from "../../base/colors";
import borders from "../../base/borders";

// Soft UI Dashboard React helper functions
import pxToRem from "../../functions/pxToRem";

const { lg } = boxShadows;
const { size } = typography;
const { text, white, transparent, light, dark, gradients } = colors;
const { borderRadius } = borders;

const whiteSimplePaletteColorOptions = white as SimplePaletteColorOptions;
const transparentSimplePaletteColorOptions =
  transparent as SimplePaletteColorOptions;
const lightSimplePaletteColorOptions = light as SimplePaletteColorOptions;
const darkSimplePaletteColorOptions = dark as SimplePaletteColorOptions;

const autocomplete: {
  defaultProps?: ComponentsProps["MuiAutocomplete"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiAutocomplete"];
  variants?: ComponentsVariants["MuiAutocomplete"];
} = {
  styleOverrides: {
    popper: {
      boxShadow: lg,
      padding: pxToRem(8),
      fontSize: size!.sm,
      color: text!.main,
      textAlign: "left",
      backgroundColor: `${whiteSimplePaletteColorOptions.main} !important`,
      borderRadius: borderRadius.md,
    },

    paper: {
      boxShadow: "none",
      backgroundColor: transparentSimplePaletteColorOptions.main,
    },

    option: {
      padding: `${pxToRem(4.8)} ${pxToRem(16)}`,
      borderRadius: borderRadius.md,
      fontSize: size!.sm,
      color: text!.main,
      transition: "background-color 300ms ease, color 300ms ease",

      "&:hover, &:focus, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus":
        {
          backgroundColor: lightSimplePaletteColorOptions.main,
          color: darkSimplePaletteColorOptions.main,
        },

      '&[aria-selected="true"]': {
        backgroundColor: `${lightSimplePaletteColorOptions.main} !important`,
        color: `${darkSimplePaletteColorOptions.main} !important`,
      },
    },

    noOptions: {
      fontSize: size!.sm,
      color: text!.main,
    },

    groupLabel: {
      color: darkSimplePaletteColorOptions.main,
    },

    loading: {
      fontSize: size!.sm,
      color: text!.main,
    },

    tag: {
      display: "flex",
      alignItems: "center",
      height: "auto",
      padding: pxToRem(4),
      backgroundColor: gradients.dark.state,
      color: whiteSimplePaletteColorOptions.main,

      "& .MuiChip-label": {
        lineHeight: 1.2,
        padding: `0 ${pxToRem(10)} 0 ${pxToRem(4)}`,
      },

      "& .MuiSvgIcon-root, & .MuiSvgIcon-root:hover, & .MuiSvgIcon-root:focus":
        {
          color: whiteSimplePaletteColorOptions.main,
          marginRight: 0,
        },
    },
  },
};

export default autocomplete;
