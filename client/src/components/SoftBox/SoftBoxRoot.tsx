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
import { Palette, styled, Theme, } from "@mui/material/styles";
import { Property, Globals } from "csstype"
import { ValidBorderRadius } from "../../assets/theme/base/borders";
import { isButtonBoxShadow, isSliderBoxShadow, isTabsBoxShadow, ValidBoxShadows } from "../../assets/theme/base/boxShadows";
import { ResponsiveStyleValue } from "@mui/system";

export enum NormalColors {
    transparent = "transparent",
    white = "white",
    black = "black",
    primary = "primary",
    secondary = "secondary",
    info = "info",
    success = "success",
    warning = "warning",
    error = "error",
    light = "light",
    dark = "dark",
    text = "text",
}

export enum GreyColors {
    grey100 = "grey-100",
    grey200 = "grey-200",
    grey300 = "grey-300",
    grey400 = "grey-400",
    grey500 = "grey-500",
    grey600 = "grey-600",
    grey700 = "grey-700",
    grey800 = "grey-800",
    grey900 = "grey-900",
}

export type SoftBoxColors = NormalColors | GreyColors

export function getPaletteColorForGreyColors(color: GreyColors, palette: Palette): string | undefined {
    const { grey } = palette
    const greyColors = new Map<GreyColors, string>([
        [GreyColors.grey100, grey[100]],
        [GreyColors.grey200, grey[200]],
        [GreyColors.grey300, grey[300]],
        [GreyColors.grey400, grey[400]],
        [GreyColors.grey500, grey[500]],
        [GreyColors.grey600, grey[600]],
        [GreyColors.grey700, grey[700]],
        [GreyColors.grey800, grey[800]],
        [GreyColors.grey900, grey[900]],
    ])
    return greyColors.get(color)
}

export function getPaletteColorForSoftBoxColors(color: SoftBoxColors, palette: Palette): string | undefined {
    const greyColor = Object.entries(GreyColors).find(([key]) => key === color.toString())?.[1]
    const normalColor = Object.entries(NormalColors).find(([key]) => key === color.toString())?.[1]
    if (greyColor) {
        return getPaletteColorForGreyColors(greyColor, palette);
    }

    if (!normalColor) return undefined;

    return palette[normalColor].main;
}

export enum Gradients {
    primary = "primary",
    secondary = "secondary",
    info = "info",
    success = "success",
    warning = "warning",
    error = "error",
    dark = "dark",
    light = "light",
}

export type Variant = "contained" | "gradient"

export type OwnerState = {
    variant?: Variant;
    bgColor?: Gradients | SoftBoxColors | string;
    color?: string;
    // color: ResponsiveStyleValue<string[] | Property.Color | undefined> |
    // ((theme: Theme) => ResponsiveStyleValue<string[] | Property.Color | undefined>);
    // color?: string[] | Property.Color | Property.Color[] | undefined;
    borderRadius?:
    ResponsiveStyleValue<
        Property.BorderRadius<string | number>
        | NonNullable<Property.BorderRadius<string | number>
            | undefined>[]
        | undefined>
    | ((theme: Theme) => ResponsiveStyleValue<Property.BorderRadius<string | number> | NonNullable<Property.BorderRadius<string | number> | undefined>[] | undefined>);
    shadow?: ValidBoxShadows | Property.BoxShadow;
    opacity?: Property.Opacity | NonNullable<Property.Opacity | undefined>[] | ((string & {}) | Globals)[] | undefined;
}

export interface SoftBoxRootProps {
    ownerState: OwnerState
}

export default styled(Box)<SoftBoxRootProps>(({ theme, ownerState }) => {
    const { palette, functions, borders, boxShadows } = theme;
    const { variant, bgColor, color, opacity, borderRadius, shadow } = ownerState;

    const { gradients, white } = palette;
    const { linearGradient } = functions;
    const { borderRadius: radius } = borders;

    // background value
    let backgroundValue: Property.Background | undefined;

    if (variant === "gradient") {
        const gradient = Object.values(Gradients).find(v => v === bgColor)
        backgroundValue = gradient
            ? linearGradient(gradients[gradient].main, gradients[gradient].state)
            : white.main;
    } else if (typeof bgColor === "string") {
        backgroundValue = bgColor;
    } else if (bgColor) {
        backgroundValue = getPaletteColorForSoftBoxColors(bgColor, palette);
    }

    // color value
    // let colorValue: Property.Color | string[] | Property.Color[] | undefined = color;
    let colorValue: string[] | Property.Color | Property.Color[] | undefined = color ? [color] : undefined;
    const greyColor = color ? Object.entries(GreyColors).find(([key]) => key === color)?.[1] : undefined;
    const normalColor = color ? Object.entries(NormalColors).find(([key]) => key === color)?.[1] : undefined
    if (greyColor) {
        colorValue = getPaletteColorForGreyColors(greyColor, palette);
    }
    else if (normalColor) {
        colorValue = palette[normalColor].main;
    }

    // borderRadius value
    let borderRadiusValue: (string | (string & {}))[] | Property.BorderRadius<string | number> | NonNullable<Property.BorderRadius<string | number> | undefined>[] | undefined
        = undefined// radius[borderRadius]; //borderRadius;

    const validBorderRadius = borderRadius ? Object.entries(ValidBorderRadius).find(([key]) => key === borderRadius)?.[1] : undefined
    if (validBorderRadius) {
        borderRadiusValue = radius[validBorderRadius]
    }

    // if (validBorderRadius.find((el) => el === borderRadius)) {
    //     borderRadiusValue = radius[borderRadius];
    // }

    // boxShadow value
    let boxShadowValue: Property.BoxShadow | undefined = shadow//boxShadows[shadow]//boxShadows;
    const existingValidBoxShadow = shadow ? Object.entries(boxShadows).find(([key]) => key === shadow)?.[1] : undefined;
    if (existingValidBoxShadow) {
        if (typeof existingValidBoxShadow === "string") {
            boxShadowValue = existingValidBoxShadow;
        }
        else if (isSliderBoxShadow(existingValidBoxShadow)) {
            boxShadowValue = existingValidBoxShadow.thumb;
        }
        else if (isButtonBoxShadow(existingValidBoxShadow)) {
            boxShadowValue = existingValidBoxShadow.main;
        }
        else if (isTabsBoxShadow(existingValidBoxShadow)) {
            boxShadowValue = existingValidBoxShadow.indicator;
        }
    }

    // if (validBoxShadows.find((el) => el === shadow)) {
    //     boxShadowValue = boxShadows[shadow];
    // }

    return {
        opacity,
        background: backgroundValue,
        color: colorValue,
        borderRadius: borderRadiusValue,
        boxShadow: boxShadowValue,
    };
});
