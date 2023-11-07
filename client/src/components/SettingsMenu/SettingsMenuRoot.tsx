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
import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export type SettingsMenuRootOwnerState = {
    openSettingsMenu: boolean;
}

export type SettingsMenuRootProps = {
    ownerState: SettingsMenuRootOwnerState
}

export default styled(Drawer)<SettingsMenuRootProps>(({ theme, ownerState }) => {
    const { boxShadows, functions, transitions } = theme;
    const { openSettingsMenu } = ownerState;

    const configuratorWidth = 360;
    const { lg } = boxShadows;
    const { pxToRem } = functions;

    // drawer styles when openSettingsMenu={true}
    const drawerOpenStyles = () => ({
        width: configuratorWidth,
        left: "initial",
        right: 0,
        transition: transitions.create("right", {
            easing: transitions.easing.sharp,
            duration: transitions.duration.short,
        }),
    });

    // drawer styles when openSettingsMenu={false}
    const drawerCloseStyles = () => ({
        left: "initial",
        right: pxToRem(-350),
        transition: transitions.create("all", {
            easing: transitions.easing.sharp,
            duration: transitions.duration.short,
        }),
    });

    return {
        "& .MuiDrawer-paper": {
            height: "100vh",
            margin: 0,
            padding: `0 ${pxToRem(10)}`,
            borderRadius: 0,
            boxShadow: lg,
            overflowY: "auto",
            ...(openSettingsMenu ? drawerOpenStyles() : drawerCloseStyles()),
        },
    };
});
