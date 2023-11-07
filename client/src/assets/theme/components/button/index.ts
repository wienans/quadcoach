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

// Soft UI Dashboard React Button Styles
import root from "./root";
import contained from "./contained";
import outlined from "./outlined";
import buttonText from "./text";

const button: {
  defaultProps?: ComponentsProps["MuiButton"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiButton"];
  variants?: ComponentsVariants["MuiButton"];
} = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: { ...(root as Record<string, unknown>) },
    contained: { ...(contained!.base as Record<string, unknown>) },
    containedSizeSmall: { ...(contained.small as object) },
    containedSizeLarge: { ...(contained.large as object) },
    containedPrimary: { ...(contained.primary as object) },
    containedSecondary: { ...(contained.secondary as object) },
    outlined: { ...(outlined.base as object) },
    outlinedSizeSmall: { ...(outlined.small as object) },
    outlinedSizeLarge: { ...(outlined.large as object) },
    outlinedPrimary: { ...(outlined.primary as object) },
    outlinedSecondary: { ...(outlined.secondary as object) },
    text: { ...(buttonText.base as object) },
    textSizeSmall: { ...(buttonText.small as object) },
    textSizeLarge: { ...(buttonText.large as object) },
    textPrimary: { ...(buttonText.primary as object) },
    textSecondary: { ...(buttonText.secondary as object) },
  },
};

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    white: true;
    dark: true;
    light: true;
  }

  interface ButtonPropsVariantOverrides {
    gradient: true;
  }
}

export default button;
