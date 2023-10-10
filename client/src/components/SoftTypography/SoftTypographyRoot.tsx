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
import { Property, } from "csstype"
import { getGradientColor, getPaletteColor } from "../../assets/theme/base/colors";

export interface TypographyOwnerState {
    verticalAlign?: "unset" | "baseline" | "sub" | "super" | "text-top" | "text-bottom" | "middle" | "top" | "bottom";
    opacity?: Property.Opacity;
    textGradient?: boolean;
    fontWeight?: false | "light" | "regular" | "medium" | "bold";
    textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
    color?: "inherit" | "primary" | "secondary" | "info" | "success" | "warning" | "error" | "light" | "dark" | "text" | "white",
}

export interface SoftTypographyRootProps extends Omit<TypographyProps, "position"> {
    ownerState: TypographyOwnerState;
}

export default styled(Typography)<SoftTypographyRootProps>(({ theme, ownerState }) => {
    const { palette, typography, functions } = theme;
    const { color, textTransform, verticalAlign, fontWeight, opacity, textGradient, } = ownerState;

    const { gradients, transparent } = palette;
    const { fontWeightLight, fontWeightRegular, fontWeightMedium, fontWeightBold } = typography;
    const { linearGradient } = functions;

    // fontWeight styles
    const fontWeights: Record<string, Property.FontWeight | undefined> = {
        light: fontWeightLight,
        regular: fontWeightRegular,
        medium: fontWeightMedium,
        bold: fontWeightBold,
    };

    const paletteColor = color && typeof color === "string" ? getPaletteColor(color, palette) : undefined;

    // styles for the typography with textGradient={true}
    const gradientStyles = () => {
        const gradientColor = color && typeof color === "string" ? getGradientColor(color, palette) : undefined;

        if (!gradientColor) return;

        return {
            backgroundImage: gradientColor ? linearGradient(gradientColor.main, gradientColor.state)
                : linearGradient(gradients.dark.main, gradients.dark.state),
            display: "inline-block",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: transparent.main,
            zIndex: 1,
        };
    };

    return {
        opacity,
        textTransform,
        verticalAlign,
        textDecoration: "none",
        color: paletteColor?.main ?? "inherit",
        ...(fontWeight && { fontWeight: fontWeights[fontWeight] && fontWeights[fontWeight] }),
        position: "relative",
        ...(textGradient && gradientStyles()),
    };
});
