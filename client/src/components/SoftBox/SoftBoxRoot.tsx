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
import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import { Property, Globals } from "csstype";
import { ValidBorderRadius } from "../../assets/theme/base/borders";
import {
  isButtonBoxShadow,
  isSliderBoxShadow,
  isTabsBoxShadow,
  ValidBoxShadows,
} from "../../assets/theme/base/boxShadows";
import { ResponsiveStyleValue } from "@mui/system";
import {
  isPaletteColor,
  PaletteGradients,
} from "../../assets/theme/base/paletteTypes";
import {
  getPaletteColorForGreyColors,
  getPaletteColorForSoftBoxColors,
  GreyColors,
  NormalColors,
} from "./softBoxRootHelper";

export type SoftBoxColors = NormalColors | GreyColors;

export type Variant = "contained" | "gradient";

export type Gradients = keyof PaletteGradients;

export type OwnerState = {
  variant?: Variant;
  bgColor?: Gradients | SoftBoxColors | string;
  color?: string;
  borderRadius?:
    | ResponsiveStyleValue<
        | Property.BorderRadius<string | number>
        | NonNullable<Property.BorderRadius<string | number> | undefined>[]
        | undefined
      >
    | ((
        theme: Theme,
      ) => ResponsiveStyleValue<
        | Property.BorderRadius<string | number>
        | NonNullable<Property.BorderRadius<string | number> | undefined>[]
        | undefined
      >);
  shadow?: ValidBoxShadows | Property.BoxShadow;
  opacity?:
    | Property.Opacity
    | NonNullable<Property.Opacity | undefined>[]
    | ((string & object) | Globals)[]
    | undefined;
};

export interface SoftBoxRootProps {
  ownerState: OwnerState;
}

const SoftBoxRoot = styled(Box)<SoftBoxRootProps>(({ theme, ownerState }) => {
  const { palette, functions, borders, boxShadows } = theme;
  const { variant, bgColor, color, opacity, borderRadius, shadow } = ownerState;

  const { gradients, white } = palette;
  const { linearGradient } = functions;
  const { borderRadius: radius } = borders;

  // background value
  let backgroundValue: Property.Background | undefined = bgColor;
  if (variant === "gradient") {
    const gradient = bgColor
      ? gradients[bgColor as keyof PaletteGradients]
      : undefined;
    backgroundValue = gradient
      ? linearGradient(gradient.main, gradient.state)
      : white.main;
  } else if (bgColor) {
    const paletteColor = getPaletteColorForSoftBoxColors(bgColor, palette);
    backgroundValue = paletteColor ? paletteColor : bgColor;
  }

  // color value
  let colorValue: string[] | Property.Color | Property.Color[] | undefined =
    color ? [color] : undefined;
  const greyColor = color
    ? Object.entries(GreyColors).find(([key]) => key === color)?.[1]
    : undefined;
  if (greyColor) {
    colorValue = getPaletteColorForGreyColors(greyColor, palette);
  } else if (color && isPaletteColor(palette[color as NormalColors])) {
    colorValue = palette[color as NormalColors].main;
  }

  // border radius
  let borderRadiusValue:
    | (string | (string & object))[]
    | Property.BorderRadius<string | number>
    | NonNullable<Property.BorderRadius<string | number> | undefined>[]
    | undefined = undefined;
  const validBorderRadius = borderRadius
    ? Object.entries(ValidBorderRadius).find(
        ([key]) => key === borderRadius,
      )?.[1]
    : undefined;
  if (validBorderRadius) {
    borderRadiusValue = radius[validBorderRadius];
  }

  // box shadow
  let boxShadowValue: Property.BoxShadow | undefined = shadow; //boxShadows[shadow]//boxShadows;
  const existingValidBoxShadow = shadow
    ? Object.entries(boxShadows).find(([key]) => key === shadow)?.[1]
    : undefined;
  if (existingValidBoxShadow) {
    if (typeof existingValidBoxShadow === "string") {
      boxShadowValue = existingValidBoxShadow;
    } else if (isSliderBoxShadow(existingValidBoxShadow)) {
      boxShadowValue = existingValidBoxShadow.thumb;
    } else if (isButtonBoxShadow(existingValidBoxShadow)) {
      boxShadowValue = existingValidBoxShadow.main;
    } else if (isTabsBoxShadow(existingValidBoxShadow)) {
      boxShadowValue = existingValidBoxShadow.indicator;
    }
  }

  return {
    opacity,
    background: backgroundValue,
    color: colorValue,
    borderRadius: borderRadiusValue,
    boxShadow: boxShadowValue,
  };
});

export default SoftBoxRoot;
