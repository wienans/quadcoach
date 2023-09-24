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
import { ComponentsOverrides, ComponentsProps, ComponentsVariants, Theme } from "@mui/material";

// Soft UI Dashboard React Button Styles
import root from "./root";
import contained from "./contained";
import outlined from "./outlined";
import buttonText from "./text";

const button: {
  defaultProps?: ComponentsProps['MuiButton'];
  styleOverrides?: ComponentsOverrides<Theme>['MuiButton'];
  variants?: ComponentsVariants['MuiButton'];
} = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: { ...(root as Record<string, unknown>) },
    contained: { ...(contained!.base as Record<string, unknown>) },
    containedSizeSmall: { ...contained.small as {} },
    containedSizeLarge: { ...contained.large as {} },
    containedPrimary: { ...contained.primary as {} },
    containedSecondary: { ...contained.secondary as {} },
    outlined: { ...outlined.base as {} },
    outlinedSizeSmall: { ...outlined.small as {} },
    outlinedSizeLarge: { ...outlined.large as {} },
    outlinedPrimary: { ...outlined.primary as {} },
    outlinedSecondary: { ...outlined.secondary as {} },
    text: { ...buttonText.base as {} },
    textSizeSmall: { ...buttonText.small as {} },
    textSizeLarge: { ...buttonText.large as {} },
    textPrimary: { ...buttonText.primary as {} },
    textSecondary: { ...buttonText.secondary as {} },
  },
};

export default button;
