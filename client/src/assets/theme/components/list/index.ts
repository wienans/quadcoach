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

const list: {
  defaultProps?: ComponentsProps["MuiList"];
  styleOverrides?: ComponentsOverrides<Theme>["MuiList"];
  variants?: ComponentsVariants["MuiList"];
} = {
  styleOverrides: {
    padding: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
};

export default list;
