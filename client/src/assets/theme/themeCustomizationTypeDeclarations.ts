import { Theme } from "@mui/material/styles"
// const theme: Theme = {
//     palette
// }

export type PaletteGradient = {
    main: string;
    state: string;
}

export type PaletteGradients = {
    primary: PaletteGradient;
    secondary: PaletteGradient;
    info: PaletteGradient;
    success: PaletteGradient;
    warning: PaletteGradient;
    error: PaletteGradient;
    light: PaletteGradient;
    dark: PaletteGradient;
}

export type PaletteSocialMediaColor = {
    main: string;
    dark: string;
}

export type PaletteSocialMediaColors = {
    facebook: PaletteSocialMediaColor;
    twitter: PaletteSocialMediaColor;
    instagram: PaletteSocialMediaColor;
    linkedin: PaletteSocialMediaColor;
    pinterest: PaletteSocialMediaColor;
    youtube: PaletteSocialMediaColor;
    vimeo: PaletteSocialMediaColor;
    slack: PaletteSocialMediaColor;
    dribbble: PaletteSocialMediaColor;
    github: PaletteSocialMediaColor;
    reddit: PaletteSocialMediaColor;
    tumblr: PaletteSocialMediaColor;
}

export type AlertColor = {
    main: string;
    state: string;
    border: string;
}

export type AlertColors = {
    primary: AlertColor;
    secondary: AlertColor;
    info: AlertColor;
    success: AlertColor;
    warning: AlertColor;
    error: AlertColor;
    light: AlertColor;
    dark: AlertColor;
}

export type BadgeColor = {
    background: string,
    text: string,
}

export type BadgeColors = {
    primary: BadgeColor;
    secondary: BadgeColor;
    info: BadgeColor;
    success: BadgeColor;
    warning: BadgeColor;
    error: BadgeColor;
    light: BadgeColor;
    dark: BadgeColor;
}

export type PaletteInputColorsBorderColor = {
    main: string;
    focus: string;
}

export type PaletteInputColors = {
    borderColor: PaletteInputColorsBorderColor;
    boxShadow: string,
    error: string,
    success: string,
}

export type PaletteSliderColorsThumb = {
    borderColor: string;
}

export type PaletteSliderColors = {
    thumb: PaletteSliderColorsThumb;
}

export type PaletteCircleSliderColors = {
    background: string;
}

export type PaletteTabsIndicator = {
    boxShadow: string;
}

export type PaletteTabs = {
    indicator: PaletteTabsIndicator;
}

declare module '@mui/material/styles/createPalette' {
    interface Palette {
        transparent: PaletteColor;
        white: PaletteColor;
        black: PaletteColor;
        light: PaletteColor;
        dark: PaletteColor;
        gradients: PaletteGradients;
        socialMediaColors: PaletteSocialMediaColors;
        alertColors: AlertColors;
        badgeColors: BadgeColors;
        inputColors: PaletteInputColors;
        sliderColors: PaletteSliderColors;
        circleSliderColors: PaletteCircleSliderColors;
        tabs: PaletteTabs;
    }

    interface PaletteOptions {
        transparent: PaletteColorOptions;
        white: PaletteColorOptions;
        black: PaletteColorOptions;
        light: PaletteColorOptions;
        dark: PaletteColorOptions;
        gradients: PaletteGradients;
        socialMediaColors: PaletteSocialMediaColors;
        alertColors: AlertColors;
        badgeColors: BadgeColors;
        inputColors: PaletteInputColors;
        sliderColors: PaletteSliderColors;
        circleSliderColors: PaletteCircleSliderColors;
        tabs: PaletteTabs;
    }

    interface TypeText {
        main: string;
        focus: string;
    }

    interface PaletteColor {
        focus?: string;
    }

    interface SimplePaletteColorOptions {
        focus?: string;
    }
}
