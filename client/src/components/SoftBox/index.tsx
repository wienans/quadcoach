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

import { forwardRef } from "react";
import { Property } from "csstype";

// Custom styles for SoftBox
import SoftBoxRoot, { Gradients, SoftBoxColors, Variant } from "./SoftBoxRoot";
import { BoxProps } from "@mui/material";
import { ValidBoxShadows } from "../../assets/theme/base/boxShadows";

// TODO improve SoftBox to split gradients props from normal color settings, so that it is clear which gradients are available
export interface SoftBoxProps extends BoxProps {
    bgColor?: Gradients | SoftBoxColors | string;
    opacity?: number;
    variant?: Variant;
    shadow?: ValidBoxShadows | Property.BoxShadow;
    color?: string;
}

const SoftBox = forwardRef<HTMLDivElement, SoftBoxProps>(
    ({ variant = "contained", bgColor = "transparent", color = "dark", opacity = 1, borderRadius = "none", shadow = "none", ...rest }, ref) => (
        <SoftBoxRoot
            {...rest}
            ref={ref}
            ownerState={{ variant, bgColor, color, opacity, borderRadius, shadow }}
        />
    )
);

// Setting default values for the props of SoftBox
SoftBox.defaultProps = {
    variant: "contained",
    bgColor: "transparent",
    color: "dark",
    opacity: 1,
    borderRadius: "none",
    shadow: "none",
};

export default SoftBox;
