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
import colors from "../base/colors";
import borders from "../base/borders";
import boxShadows from "../base/boxShadows";

// Soft UI Dashboard React helper functions
import linearGradient from "../functions/linearGradient";
import pxToRem from "../functions/pxToRem";

const { light, white, sliderColors, black, gradients } = colors;
const { borderRadius, borderWidth } = borders;
const { sliderBoxShadow } = boxShadows;

const slider: {
  defaultProps?: ComponentsProps['MuiSlider'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiSlider'];
  variants?: ComponentsVariants['MuiSlider'];
} = {
  styleOverrides: {
    root: {
      width: "100%",

      "& .MuiSlider-active, & .Mui-focusVisible": {
        boxShadow: "none !important",
      },

      "& .MuiSlider-valueLabel": {
        color: (black as SimplePaletteColorOptions).main,
      },
    },

    rail: {
      height: pxToRem(3),
      backgroundColor: (light as SimplePaletteColorOptions).main,
      borderRadius: borderRadius.sm,
    },

    track: {
      backgroundImage: linearGradient(gradients.info.main, gradients.info.state),
      height: pxToRem(6),
      position: "relative",
      top: pxToRem(2),
      border: "none",
      borderRadius: borderRadius.lg,
      zIndex: 1,
    },

    thumb: {
      width: pxToRem(15),
      height: pxToRem(15),
      backgroundColor: (white as SimplePaletteColorOptions).main,
      zIndex: 10,
      boxShadow: sliderBoxShadow.thumb,
      border: `${borderWidth[1]} solid ${sliderColors.thumb.borderColor}`,

      "&:hover": {
        boxShadow: "none",
      },
    },
  },
};

export default slider;
