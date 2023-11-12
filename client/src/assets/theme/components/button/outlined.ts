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
  ButtonProps,
  CSSInterpolation,
  SimplePaletteColorOptions,
  Theme,
} from "@mui/material";

// Soft UI Dashboard React Base Styles
import colors from "../../base/colors";
import typography from "../../base/typography";
import boxShadows from "../../base/boxShadows";

// Soft UI Dashboard React Helper Functions
import pxToRem from "../../functions/pxToRem";

const { transparent, light, info, secondary } = colors;
const { size } = typography;
const { buttonBoxShadow } = boxShadows;

export type Outlined = {
  base:
    | CSSInterpolation
    | ((
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        props: { ownerState: ButtonProps & Record<string, unknown> } & {
          theme: Theme;
        } & Record<string, unknown>,
      ) => CSSInterpolation);
  small:
    | CSSInterpolation
    | ((
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        props: { ownerState: ButtonProps & Record<string, unknown> } & {
          theme: Theme;
        } & Record<string, unknown>,
      ) => CSSInterpolation);
  large:
    | CSSInterpolation
    | ((
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        props: { ownerState: ButtonProps & Record<string, unknown> } & {
          theme: Theme;
        } & Record<string, unknown>,
      ) => CSSInterpolation);
  primary:
    | CSSInterpolation
    | ((
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        props: { ownerState: ButtonProps & Record<string, unknown> } & {
          theme: Theme;
        } & Record<string, unknown>,
      ) => CSSInterpolation);
  secondary:
    | CSSInterpolation
    | ((
        // Record<string, unknown> is for other props that the slot receive internally
        // Documenting all ownerStates could be a huge work, let's wait until we have a real needs from developers.
        props: { ownerState: ButtonProps & Record<string, unknown> } & {
          theme: Theme;
        } & Record<string, unknown>,
      ) => CSSInterpolation);
};

const outlined: Outlined = {
  base: {
    minHeight: pxToRem(42),
    color: (light as SimplePaletteColorOptions).main,
    borderColor: (light as SimplePaletteColorOptions).main,
    padding: `${pxToRem(12)} ${pxToRem(24)}`,

    "&:hover": {
      opacity: 0.75,
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      boxShadow: buttonBoxShadow.stateOfNotHover,
    },

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(16)} !important`,
    },
  },

  small: {
    minHeight: pxToRem(34),
    padding: `${pxToRem(8)} ${pxToRem(32)}`,
    fontSize: size!.xs,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(12)} !important`,
    },
  },

  large: {
    minHeight: pxToRem(49),
    padding: `${pxToRem(14)} ${pxToRem(64)}`,
    fontSize: size!.sm,

    "& .material-icon, .material-icons-round, svg": {
      fontSize: `${pxToRem(22)} !important`,
    },
  },

  primary: {
    backgroundColor: (transparent as SimplePaletteColorOptions).main,
    borderColor: (info as SimplePaletteColorOptions).main,

    "&:hover": {
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      boxShadow: buttonBoxShadow.stateOfNotHover,
    },
  },

  secondary: {
    backgroundColor: (transparent as SimplePaletteColorOptions).main,
    borderColor: (secondary as SimplePaletteColorOptions).main,

    "&:hover": {
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      boxShadow: buttonBoxShadow.stateOfNotHover,
    },
  },
};

export default outlined;
