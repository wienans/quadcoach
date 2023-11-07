/**
=========================================================
* Soft UI Dashboard React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-pro-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { ReactNode, Ref } from "react";

// Custom styles for SoftButton
import SoftButtonRoot from "./SoftButtonRoot";
import { ButtonProps } from "@mui/material";

export type SoftButtonProps<C extends React.ElementType> = ButtonProps<
  C,
  { component?: C; ref?: C }
> & {
  children: ReactNode;
  circular?: boolean;
  iconOnly?: boolean;
};

const SoftButton = <C extends React.ElementType>(
  {
    color,
    variant = "contained",
    size = "medium",
    circular = false,
    iconOnly = false,
    children,
    ...rest
  }: SoftButtonProps<C>,
  ref?: Ref<C>,
) => (
  <SoftButtonRoot
    {...rest}
    ref={ref}
    color="primary"
    variant={variant === "gradient" ? "contained" : variant}
    size={size}
    ownerState={{ color, variant, size, circular, iconOnly }}
  >
    {children}
  </SoftButtonRoot>
);

export default SoftButton;
