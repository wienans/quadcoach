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
import borders from "../../base/borders";

// Soft UI Dashboard React Helper Functions
import pxToRem from "../../functions/pxToRem";

const { borderRadius } = borders;

const cardMedia: {
  defaultProps?: ComponentsProps["MuiCardMedia"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiCardMedia"];
  variants?: ComponentsVariants["MuiCardMedia"];
} = {
  styleOverrides: {
    root: {
      borderRadius: borderRadius.xl,
      margin: `${pxToRem(16)} ${pxToRem(16)} 0`,
    },

    media: {
      width: "auto",
    },
  },
};

export default cardMedia;
