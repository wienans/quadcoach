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
import { styled } from "@mui/material/styles";

export type SoftInputIconBoxRootOwnerState = {
    size: InputBaseProps["size"]
}

export type SoftInputIconBoxRootProps = {
    ownerState: SoftInputIconBoxRootOwnerState
}

export default styled("div")<SoftInputIconBoxRootProps>(({ theme, ownerState }) => {
    const { palette, functions } = theme;
    const { size } = ownerState;

    const { dark } = palette;
    const { pxToRem } = functions;

    return {
        lineHeight: 0,
        padding: size === "small" ? `${pxToRem(4)} ${pxToRem(10)}` : `${pxToRem(8)} ${pxToRem(10)}`,
        width: pxToRem(39),
        height: "100%",
        color: dark.main,
    };
});
