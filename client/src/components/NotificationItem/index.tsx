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

import { ReactNode, forwardRef } from "react";

// @mui material components
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography } from "..";

// custom styles for the NotificationItem
import { menuItem, menuImage } from "./styles";
import { PaletteGradients } from "../../assets/theme/base/paletteTypes";

export interface NotificationItemProps extends Omit<MenuItemProps, "title"> {
  color?: keyof PaletteGradients;
  image: ReactNode;
  title: [string, string];
  date: string;
}

const NotificationItem = forwardRef<HTMLLIElement, NotificationItemProps>(
  ({ color = "dark", image, title, date, ...rest }, ref) => (
    <MenuItem {...rest} ref={ref} sx={(theme) => menuItem(theme)}>
      <SoftBox
        width="2.25rem"
        height="2.25rem"
        mt={0.25}
        mr={2}
        mb={0.25}
        borderRadius="lg"
        sx={(theme) => menuImage(theme, { color })}
      >
        {image}
      </SoftBox>
      <SoftBox>
        <SoftTypography
          variant="button"
          textTransform="capitalize"
          fontWeight="regular"
        >
          <strong>{title[0]}</strong> {title[1]}
        </SoftTypography>
        <SoftTypography
          variant="caption"
          color="secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <SoftTypography variant="button" color="secondary">
            <Icon
              sx={{
                lineHeight: 1.2,
                mr: 0.5,
              }}
            >
              watch_later
            </Icon>
          </SoftTypography>
          {date}
        </SoftTypography>
      </SoftBox>
    </MenuItem>
  ),
);

export default NotificationItem;
