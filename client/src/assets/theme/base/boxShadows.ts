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

/**
 * The base box-shadow styles for the Soft UI Dashboard React.
 * You can add new box-shadow using this file.
 * You can customized the box-shadow for the entire Soft UI Dashboard React using thie file.
 */
import { SimplePaletteColorOptions } from "@mui/material/styles/createPalette";

// Soft UI Dashboard React Base Styles
import colors from "./colors";

// Soft UI Dashboard React Helper Functions
import boxShadow from "../functions/boxShadow";

export type InputBoxShadow = {
  focus: string;
  error: string;
  success: string;
};

export type SliderBoxShadow = {
  thumb: string;
};

export function isSliderBoxShadow<T>(
  shadow: SliderBoxShadow | T,
): shadow is SliderBoxShadow {
  return (shadow as SliderBoxShadow).thumb !== undefined;
}

export type ButtonBoxShadow = {
  main: string;
  stateOf: string;
  stateOfNotHover: string;
};

export function isButtonBoxShadow<T>(
  shadow: ButtonBoxShadow | T,
): shadow is ButtonBoxShadow {
  return (
    (shadow as ButtonBoxShadow).main !== undefined &&
    (shadow as ButtonBoxShadow).stateOf !== undefined &&
    (shadow as ButtonBoxShadow).stateOfNotHover !== undefined
  );
}

export type TabsBoxShadow = {
  indicator: string;
};

export function isTabsBoxShadow<T>(
  shadow: TabsBoxShadow | T,
): shadow is TabsBoxShadow {
  return (shadow as TabsBoxShadow).indicator !== undefined;
}

export type BoxShadows = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  inset: string;
  navbarBoxShadow: string;
  buttonBoxShadow: ButtonBoxShadow;
  inputBoxShadow: InputBoxShadow;
  sliderBoxShadow: SliderBoxShadow;
  tabsBoxShadow: TabsBoxShadow;
};

const { black, white, info, inputColors, tabs } = colors;

const blackSimplePaletteColorOptions = black as SimplePaletteColorOptions;
const whiteSimplePaletteColorOptions = white as SimplePaletteColorOptions;

export type ValidBoxShadows =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "xxl"
  | "inset";

const boxShadows: BoxShadows = {
  xs: boxShadow([0, 2], [9, -5], blackSimplePaletteColorOptions.main, 0.15),
  sm: boxShadow([0, 5], [10, 0], blackSimplePaletteColorOptions.main, 0.12),
  md: `${boxShadow(
    [0, 4],
    [6, -1],
    blackSimplePaletteColorOptions.light!,
    0.12,
  )}, ${boxShadow(
    [0, 2],
    [4, -1],
    blackSimplePaletteColorOptions.light!,
    0.07,
  )}`,
  lg: `${boxShadow(
    [0, 8],
    [26, -4],
    blackSimplePaletteColorOptions.light!,
    0.15,
  )}, ${boxShadow(
    [0, 8],
    [9, -5],
    blackSimplePaletteColorOptions.light!,
    0.06,
  )}`,
  xl: boxShadow(
    [0, 23],
    [45, -11],
    blackSimplePaletteColorOptions.light!,
    0.25,
  ),
  xxl: boxShadow([0, 20], [27, 0], blackSimplePaletteColorOptions.main, 0.05),
  inset: boxShadow(
    [0, 1],
    [2, 0],
    blackSimplePaletteColorOptions.main,
    0.075,
    "inset",
  ),
  navbarBoxShadow: `${boxShadow(
    [0, 0],
    [1, 1],
    whiteSimplePaletteColorOptions.main,
    0.9,
    "inset",
  )}, ${boxShadow(
    [0, 20],
    [27, 0],
    blackSimplePaletteColorOptions.main,
    0.05,
  )}`,
  buttonBoxShadow: {
    main: `${boxShadow(
      [0, 4],
      [7, -1],
      blackSimplePaletteColorOptions.main,
      0.11,
    )}, ${boxShadow(
      [0, 2],
      [4, -1],
      blackSimplePaletteColorOptions.main,
      0.07,
    )}`,
    stateOf: `${boxShadow(
      [0, 3],
      [5, -1],
      blackSimplePaletteColorOptions.main,
      0.09,
    )}, ${boxShadow(
      [0, 2],
      [5, -1],
      blackSimplePaletteColorOptions.main,
      0.07,
    )}`,
    stateOfNotHover: boxShadow(
      [0, 0],
      [0, 3.2],
      (info as SimplePaletteColorOptions).main!,
      0.5,
    ),
  },
  inputBoxShadow: {
    focus: boxShadow([0, 0], [0, 2], inputColors.boxShadow, 1),
    error: boxShadow([0, 0], [0, 2], inputColors.error, 0.6),
    success: boxShadow([0, 0], [0, 2], inputColors.success, 0.6),
  },
  sliderBoxShadow: {
    thumb: boxShadow([0, 1], [13, 0], blackSimplePaletteColorOptions.main, 0.2),
  },
  tabsBoxShadow: {
    indicator: boxShadow([0, 1], [5, 1], tabs.indicator.boxShadow, 1),
  },
};

declare module "@mui/material/styles" {
  interface Theme {
    boxShadows: BoxShadows;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    boxShadows: BoxShadows;
  }
}

export default boxShadows;
