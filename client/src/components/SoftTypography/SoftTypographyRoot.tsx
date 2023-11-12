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
import Typography, { TypographyProps } from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { Palette, PaletteColor, TypeText } from "@mui/material";
import { Property } from "csstype";
import { PickByType, isObjKey } from "../../helpers/typeHelpers";
import {
  PaletteGradient,
  PaletteGradients,
} from "../../assets/theme/base/paletteTypes";

export interface TypographyOwnerState {
  verticalAlign?: Property.VerticalAlign; //CSSProperties["verticalAlign"] //"unset" | "baseline" | "sub" | "super" | "text-top" | "text-bottom" | "middle" | "top" | "bottom";
  opacity?: Property.Opacity;
  textGradient?: boolean;
  fontWeight?: false | "light" | "regular" | "medium" | "bold";
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
  color?:
    | "inherit"
    | keyof PickByType<Palette, PaletteColor>
    | keyof PaletteGradients
    | keyof PickByType<Palette, TypeText>;
}

export interface SoftTypographyRootProps
  extends Omit<TypographyProps, "position"> {
  ownerState: TypographyOwnerState;
}

const SoftTypographyRoot = styled(Typography)<SoftTypographyRootProps>(({
  theme,
  ownerState,
}) => {
  const { palette, typography, functions } = theme;
  const {
    color,
    textTransform,
    verticalAlign,
    fontWeight,
    opacity,
    textGradient,
  } = ownerState;

  const { gradients, transparent } = palette;
  const {
    fontWeightLight,
    fontWeightRegular,
    fontWeightMedium,
    fontWeightBold,
  } = typography;
  const { linearGradient } = functions;

  // fontWeight styles
  const fontWeights: Record<string, Property.FontWeight | undefined> = {
    light: fontWeightLight,
    regular: fontWeightRegular,
    medium: fontWeightMedium,
    bold: fontWeightBold,
  };

  // styles for the typography with textGradient={true}
  const gradientStyles = () => {
    let gradientColor: PaletteGradient | undefined = undefined;
    if (color && isObjKey<PaletteGradients>(color, palette.gradients)) {
      gradientColor = palette.gradients[color];
    }

    if (!gradientColor) return;

    return {
      backgroundImage: gradientColor
        ? linearGradient(gradientColor.main, gradientColor.state)
        : linearGradient(gradients.dark.main, gradients.dark.state),
      display: "inline-block",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: transparent.main,
      zIndex: 1,
    };
  };

  const getColor = (): string => {
    if (!color) return "inherit";

    if (isObjKey<PickByType<Palette, PaletteColor>>(color, palette))
      return palette[color].main;

    if (isObjKey<PickByType<Palette, TypeText>>(color, palette))
      return palette[color].main;

    return "inherit";
  };

  return {
    opacity,
    textTransform,
    verticalAlign,
    textDecoration: "none",
    color: getColor(),
    ...(fontWeight && {
      fontWeight: fontWeights[fontWeight] && fontWeights[fontWeight],
    }),
    position: "relative",
    ...(textGradient && gradientStyles()),
  };
});

export default SoftTypographyRoot;
