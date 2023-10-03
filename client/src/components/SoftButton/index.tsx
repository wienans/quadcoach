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

import { ReactNode, forwardRef } from "react";

// Custom styles for SoftButton
import SoftButtonRoot from "./SoftButtonRoot";
import { ButtonProps } from "@mui/material";

export interface SoftButtonProps extends ButtonProps {
    children: ReactNode;
    circular?: boolean;
    iconOnly?: boolean;
}

const SoftButton = forwardRef<HTMLButtonElement, SoftButtonProps>(
    ({ color, variant, size, circular = false, iconOnly = false, children, ...rest }, ref) => (
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
    )
);

// Setting default values for the props of SoftButton
SoftButton.defaultProps = {
    size: "medium",
    variant: "contained",
    color: "white",
    circular: false,
    iconOnly: false,
};

export default SoftButton;
