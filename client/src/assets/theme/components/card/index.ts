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

// Soft UI Dashboard React Base Styles
import colors from "../../base/colors";
import borders from "../../base/borders";
import boxShadows from "../../base/boxShadows";

// Soft UI Dashboard React Helper Function
import rgba from "../../functions/rgba";

const { black, white } = colors;
const { borderWidth, borderRadius } = borders;
const { xxl } = boxShadows;

const whiteSimplePaletteColorOptions = white as SimplePaletteColorOptions;
const blackSimplePaletteColorOptions = black as SimplePaletteColorOptions;

const card: {
  defaultProps?: ComponentsProps["MuiCard"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiCard"];
  variants?: ComponentsVariants["MuiCard"];
} = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundColor: whiteSimplePaletteColorOptions.main,
      backgroundClip: "border-box",
      border: `${borderWidth[0]} solid ${rgba(
        blackSimplePaletteColorOptions.main,
        0.125,
      )}`,
      borderRadius: borderRadius.xl,
      boxShadow: xxl,
    },
  },
};

export default card;
