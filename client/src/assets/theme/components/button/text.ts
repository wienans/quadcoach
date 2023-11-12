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

// Soft UI Dashboard React Helper Functions
import pxToRem from "../../functions/pxToRem";

const { transparent, info, secondary, grey } = colors;
const { size } = typography;

export type ButtonText = {
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

const buttonText: ButtonText = {
  base: {
    backgroundColor: (transparent as SimplePaletteColorOptions).main,
    height: "max-content",
    color: (info as SimplePaletteColorOptions).main,
    boxShadow: "none",
    padding: `${pxToRem(6)} ${pxToRem(12)}`,

    "&:hover": {
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
      boxShadow: "none",
      color: (info as SimplePaletteColorOptions).focus,
    },

    "&:focus": {
      boxShadow: "none",
      color: (info as SimplePaletteColorOptions).focus,
    },

    "&:active, &:active:focus, &:active:hover": {
      opacity: 0.85,
      boxShadow: "none",
    },

    "&:disabled": {
      color: grey![600],
      boxShadow: "none",
    },

    "& .material-icons, .material-icons-round, svg, span": {
      fontSize: `${pxToRem(16)} !important`,
    },
  },

  small: {
    fontSize: size!.xs,

    "& .material-icons, .material-icons-round, svg, span": {
      fontSize: `${pxToRem(12)} !important`,
    },
  },

  large: {
    fontSize: size!.sm,

    "& .material-icons, .material-icons-round, svg, span": {
      fontSize: `${pxToRem(22)} !important`,
    },
  },

  primary: {
    color: (info as SimplePaletteColorOptions).main,
    backgroundColor: (transparent as SimplePaletteColorOptions).main,

    "&:hover": {
      color: (info as SimplePaletteColorOptions).focus,
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      color: (info as SimplePaletteColorOptions).focus,
      backgroundColor: (transparent as SimplePaletteColorOptions).focus,
      boxShadow: "none",
    },
  },

  secondary: {
    color: (secondary as SimplePaletteColorOptions).focus,
    backgroundColor: (transparent as SimplePaletteColorOptions).main,

    "&:hover": {
      color: (secondary as SimplePaletteColorOptions).focus,
      backgroundColor: (transparent as SimplePaletteColorOptions).main,
    },

    "&:focus:not(:hover)": {
      color: (secondary as SimplePaletteColorOptions).focus,
      backgroundColor: (transparent as SimplePaletteColorOptions).focus,
      boxShadow: "none",
    },
  },
};

export default buttonText;
