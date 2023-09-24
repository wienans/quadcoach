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
import borders from "../../base/borders";
import colors from "../../base/colors";

const { dark } = colors;
const { borderWidth, borderColor } = borders;

const stepConnector: {
  defaultProps?: ComponentsProps['MuiStepConnector'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiStepConnector'];
  variants?: ComponentsVariants['MuiStepConnector'];
} = {
  styleOverrides: {
    root: {
      color: borderColor,
      transition: "all 200ms linear",

      "&.Mui-active": {
        color: (dark as SimplePaletteColorOptions).main,
      },

      "&.Mui-completed": {
        color: (dark as SimplePaletteColorOptions).main,
      },
    },

    alternativeLabel: {
      top: "14%",
      left: "-50%",
      right: "50%",
    },

    line: {
      borderWidth: `${borderWidth[2]} !important`,
      borderColor: "currentColor",
    },
  },
};

export default stepConnector;
