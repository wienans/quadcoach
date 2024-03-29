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
  ComponentsOverrides,
  ComponentsProps,
  ComponentsVariants,
  Theme,
} from "@mui/material";

// Soft UI Dashboard React base styles
import colors from "../base/colors";
import typography from "../base/typography";

const { grey } = colors;
const { size } = typography;

const breadcrumbs: {
  defaultProps?: ComponentsProps["MuiBreadcrumbs"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiBreadcrumbs"];
  variants?: ComponentsVariants["MuiBreadcrumbs"];
} = {
  styleOverrides: {
    separator: {
      fontSize: size!.sm,
      color: grey![600],
    },
  },
};

export default breadcrumbs;
