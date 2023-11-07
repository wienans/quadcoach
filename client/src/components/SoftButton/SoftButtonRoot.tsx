/**
=========================================================
* Soft UI Dashboard React - v4.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Button, { ButtonProps } from "@mui/material/Button";
import { Palette, PaletteColor, styled } from "@mui/material/styles";
import { PaletteGradient } from "../../assets/theme/base/paletteTypes";

export type Variant = "contained" | "outlined" | "gradient" | "text";
export type Size = "small" | "medium" | "large";

const getPaletteColor = (
  color: ButtonProps["color"],
  palette: Palette,
): PaletteColor | undefined =>
  Object.entries(palette).find(
    ([key, value]) => key === color && (value as PaletteColor)?.main != null,
  )?.[1];

const getGradientColor = (
  color: ButtonProps["color"],
  palette: Palette,
): PaletteGradient | undefined =>
  Object.entries(palette.gradients).find(([key]) => key === color)?.[1];

export type OwnerState = {
  color: ButtonProps["color"];
  variant: ButtonProps["variant"];
  size: ButtonProps["size"];
  circular: boolean;
  iconOnly: boolean;
};

export interface SoftButtonRootProps extends ButtonProps {
  ownerState: OwnerState;
}

const SoftButtonRoot = styled(Button)<SoftButtonRootProps>(({
  theme,
  ownerState,
}) => {
  const { palette, functions, borders } = theme;
  const { color, variant, size, circular, iconOnly } = ownerState;

  const { white, dark, text, transparent, gradients } = palette;
  const { boxShadow, linearGradient, pxToRem, rgba } = functions;
  const { borderRadius } = borders;

  // styles for the button with variant="contained"
  const containedStyles = () => {
    const colorPalette = getPaletteColor(color, palette);
    // background color value
    const backgroundValue = colorPalette?.main ?? white.main;

    // backgroundColor value when button is focused
    const focusedBackgroundValue = colorPalette?.focus ?? white.focus;

    // boxShadow value
    const boxShadowValue = colorPalette
      ? boxShadow([0, 0], [0, 3.2], colorPalette.main, 0.5)
      : boxShadow([0, 0], [0, 3.2], dark.main, 0.5);

    // color value
    let colorValue = white.main;
    if (color === "white" || !colorPalette) {
      colorValue = text.main;
    } else if (color === "light") {
      colorValue = gradients.dark.state;
    }

    // color value when button is focused
    let focusedColorValue = white.main;

    if (color === "white") {
      focusedColorValue = text.main;
    } else if (color === "primary" || color === "error" || color === "dark") {
      focusedColorValue = white.main;
    }

    return {
      background: backgroundValue,
      color: colorValue,

      "&:hover": {
        backgroundColor: backgroundValue,
      },

      "&:focus:not(:hover)": {
        backgroundColor: focusedBackgroundValue,
        boxShadow: boxShadowValue,
      },

      "&:disabled": {
        backgroundColor: backgroundValue,
        color: focusedColorValue,
      },
    };
  };

  // styles for the button with variant="outlined"
  const outliedStyles = () => {
    const colorPalette = getPaletteColor(color, palette);
    // background color value
    const backgroundValue =
      color === "white" ? rgba(white.main, 0.1) : transparent.main;

    // color value
    const colorValue = colorPalette?.main ?? white.main;

    // boxShadow value
    const boxShadowValue = colorPalette
      ? boxShadow([0, 0], [0, 3.2], colorPalette.main, 0.5)
      : boxShadow([0, 0], [0, 3.2], white.main, 0.5);

    // border color value
    let borderColorValue = colorPalette?.main ?? rgba(white.main, 0.75);

    if (color === "white") {
      borderColorValue = rgba(white.main, 0.75);
    }

    return {
      background: backgroundValue,
      color: colorValue,
      borderColor: borderColorValue,

      "&:hover": {
        background: transparent.main,
        borderColor: colorValue,
      },

      "&:focus:not(:hover)": {
        background: transparent.main,
        boxShadow: boxShadowValue,
      },

      "&:active:not(:hover)": {
        backgroundColor: colorValue,
        color: white.main,
        opacity: 0.85,
      },

      "&:disabled": {
        color: colorValue,
        borderColor: colorValue,
      },
    };
  };

  // styles for the button with variant="gradient"
  const gradientStyles = () => {
    const gradientColor = getGradientColor(color, palette);
    // background value
    const backgroundValue =
      color === "white" || !gradientColor
        ? white.main
        : linearGradient(gradientColor.main, gradientColor.state);

    // color value
    let colorValue = white.main;

    if (color === "white") {
      colorValue = text.main;
    } else if (color === "light") {
      colorValue = gradients.dark.state;
    }

    return {
      background: backgroundValue,
      color: colorValue,

      "&:focus:not(:hover)": {
        boxShadow: "none",
      },

      "&:disabled": {
        background: backgroundValue,
        color: colorValue,
      },
    };
  };

  // styles for the button with variant="text"
  const textStyles = () => {
    const colorPalette = getPaletteColor(color, palette);
    // color value
    const colorValue = colorPalette?.main ?? white.main;

    // color value when button is focused
    const focusedColorValue = colorPalette?.focus ?? white.focus;

    return {
      color: colorValue,

      "&:hover": {
        color: focusedColorValue,
      },

      "&:focus:not(:hover)": {
        color: focusedColorValue,
      },
    };
  };

  // styles for the button with circular={true}
  const circularStyles = () => ({
    borderRadius: borderRadius.section,
  });

  // styles for the button with iconOnly={true}
  const iconOnlyStyles = () => {
    // width, height, minWidth and minHeight values
    let sizeValue = pxToRem(38);

    if (size === "small") {
      sizeValue = pxToRem(25.4);
    } else if (size === "large") {
      sizeValue = pxToRem(52);
    }

    // padding value
    let paddingValue = `${pxToRem(11)} ${pxToRem(11)} ${pxToRem(10)}`;

    if (size === "small") {
      paddingValue = pxToRem(4.5);
    } else if (size === "large") {
      paddingValue = pxToRem(16);
    }

    return {
      width: sizeValue,
      minWidth: sizeValue,
      height: sizeValue,
      minHeight: sizeValue,
      padding: paddingValue,

      "& .material-icons": {
        marginTop: 0,
      },

      "&:hover, &:focus, &:active": {
        transform: "none",
      },
    };
  };

  return {
    ...(variant === "contained" && containedStyles()),
    ...(variant === "outlined" && outliedStyles()),
    ...(variant === "gradient" && gradientStyles()),
    ...(variant === "text" && textStyles()),
    ...(circular && circularStyles()),
    ...(iconOnly && iconOnlyStyles()),
  };
});

export default SoftButtonRoot;
