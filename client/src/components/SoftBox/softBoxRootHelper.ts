import { Palette, PaletteColor } from "@mui/material/styles";
import { isPaletteColor } from "../../assets/theme/base/paletteTypes";
import { PickByType } from "../../helpers/typeHelpers";

export type NormalColors = keyof PickByType<Palette, PaletteColor>;

export enum GreyColors {
  grey100 = "grey100",
  grey200 = "grey200",
  grey300 = "grey300",
  grey400 = "grey400",
  grey500 = "grey500",
  grey600 = "grey600",
  grey700 = "grey700",
  grey800 = "grey800",
  grey900 = "grey900",
}

export function getPaletteColorForGreyColors(
  color: GreyColors,
  palette: Palette,
): string | undefined {
  const { grey } = palette;
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
  ]);
  return greyColors.get(color);
}

export function getPaletteColorForSoftBoxColors(
  color: string,
  palette: Palette,
): string | undefined {
  const greyColor = Object.entries(GreyColors).find(
    ([key]) => key === color,
  )?.[1];
  if (greyColor) {
    return getPaletteColorForGreyColors(greyColor, palette);
  }

  if (color && isPaletteColor(palette[color as NormalColors])) {
    return palette[color as NormalColors].main;
  }

  return undefined;
}
