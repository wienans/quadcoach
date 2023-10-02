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
import { ButtonProps, CSSInterpolation, SimplePaletteColorOptions, Theme } from "@mui/material";

// Soft UI Dashboard React Base Styles
import colors from "../../base/colors";
import typography from "../../base/typography";
import boxShadows from "../../base/boxShadows";

// Soft UI Dashboard React Helper Functions
import pxToRem from "../../functions/pxToRem";

const { white, text, info, secondary } = colors;
const { size } = typography;
const { buttonBoxShadow } = boxShadows;

export type Contained = {
  base: CSSInterpolation
  | ((
    // Record<string, unknown> is for other props that the slot receive internally
    // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
    props: ({ ownerState: ButtonProps & Record<string, unknown> }) & { theme: Theme } & Record<string, unknown>,
  ) => CSSInterpolation);
  small: CSSInterpolation
  | ((
    // Record<string, unknown> is for other props that the slot receive internally
    // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
    props: ({ ownerState: ButtonProps & Record<string, unknown> }) & { theme: Theme } & Record<string, unknown>,
  ) => CSSInterpolation);
  large: CSSInterpolation
  | ((
    // Record<string, unknown> is for other props that the slot receive internally
    // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
    props: ({ ownerState: ButtonProps & Record<string, unknown> }) & { theme: Theme } & Record<string, unknown>,
  ) => CSSInterpolation);
  primary: CSSInterpolation
  | ((
    // Record<string, unknown> is for other props that the slot receive internally
    // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
    props: ({ ownerState: ButtonProps & Record<string, unknown> }) & { theme: Theme } & Record<string, unknown>,
  ) => CSSInterpolation);
  secondary: CSSInterpolation
  | ((
    // Record<string, unknown> is for other props that the slot receive internally
    // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
    props: ({ ownerState: ButtonProps & Record<string, unknown> }) & { theme: Theme } & Record<string, unknown>,
  ) => CSSInterpolation);
}

const contained: Contained = {
  base: {
    backgroundColor: (white as SimplePaletteColorOptions).main,
    minHeight: pxToRem(40),
    color: text!.main,
    boxShadow: buttonBoxShadow.main,
    padding: `${pxToRem(12)} ${pxToRem(24)}`,

    "&:hover": {
      backgroundColor: (white as SimplePaletteColorOptions).main,
      boxShadow: buttonBoxShadow.stateOf,
    },

    "&:focus": {
      boxShadow: buttonBoxShadow.stateOf,
    },

    "&:active, &:active:focus, &:active:hover": {
      opacity: 0.85,
      boxShadow: buttonBoxShadow.stateOf,
    },

    "&:disabled": {
      boxShadow: buttonBoxShadow.main,
    },

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(16)} !important`,
    },
  },

  small: {
    minHeight: pxToRem(32),
    padding: `${pxToRem(8)} ${pxToRem(32)}`,
    fontSize: size!.xs,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(12)} !important`,
    },
  },

  large: {
    minHeight: pxToRem(47),
    padding: `${pxToRem(14)} ${pxToRem(64)}`,
    fontSize: size!.sm,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(22)} !important`,
    },
  },

  primary: {
    backgroundColor: (info as SimplePaletteColorOptions).main,

    "&:hover": {
      backgroundColor: (info as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      backgroundColor: (info as SimplePaletteColorOptions).focus,
      boxShadow: buttonBoxShadow.stateOfNotHover,
    },
  },

  secondary: {
    backgroundColor: (secondary as SimplePaletteColorOptions).main,

    "&:hover": {
      backgroundColor: (secondary as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      backgroundColor: (secondary as SimplePaletteColorOptions).focus,
      boxShadow: buttonBoxShadow.stateOfNotHover,
    },
  },
};

export default contained;
