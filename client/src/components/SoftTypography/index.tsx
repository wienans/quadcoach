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
import SoftTypographyRoot, { TypographyOwnerState } from "./SoftTypographyRoot";
import { TypographyProps } from "@mui/material";

export interface SoftTypographyProps extends TypographyOwnerState, Omit<TypographyProps, "color" | "textTransform" | "fontWeight" | "verticalAlign"> {
    children: ReactNode;
}

const SoftTypography = forwardRef<HTMLElement, SoftTypographyProps>(
    (
        { color, fontWeight, textTransform, verticalAlign, textGradient, opacity, children, ...rest },
        ref
    ) => (
        <SoftTypographyRoot
            {...rest}
            ref={ref}
            ownerState={{ color, textTransform, verticalAlign, fontWeight, opacity, textGradient }}
        >
            {children}
        </SoftTypographyRoot>
    )
);

// Setting default values for the props of SoftTypography
SoftTypography.defaultProps = {
    color: "dark",
    fontWeight: false,
    textTransform: "none",
    verticalAlign: "unset",
    textGradient: false,
    opacity: 1,
};

export default SoftTypography;
