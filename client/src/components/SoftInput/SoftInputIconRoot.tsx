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
import { InputBaseProps } from "@mui/material";
import Icon from "@mui/material/Icon";
import { styled } from "@mui/material/styles";

export type SoftInputIconRootOwnerState = {
    size: InputBaseProps["size"]
}

export type SoftInputIconRootProps = {
    ownerState: SoftInputIconRootOwnerState
}

export default styled(Icon)<SoftInputIconRootProps>(({ theme, ownerState }) => {
    const { typography } = theme;
    const { size } = ownerState;

    const { fontWeightBold, size: fontSize } = typography;

    return {
        fontWeight: fontWeightBold,
        ...size === "small" && {
            fontSize: `${fontSize.md} !important`,
        }
    };
});
