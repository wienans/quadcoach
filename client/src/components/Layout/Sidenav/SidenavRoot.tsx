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

export type SidenavRootOwnerState = {
  miniSidenav: boolean
}

export type SidenavRootProps = {
  ownerState: SidenavRootOwnerState
}

export default styled(Drawer)<SidenavRootProps>(({ theme, ownerState }) => {
  const { boxShadows, transitions, functions } = theme;
  const { miniSidenav } = ownerState;

  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => (
    {
      transform: "translateX(0)",
      transition: transitions.create("transform", {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      })
    }
  );

  // styles for the sidenav when miniSidenav={true}
  const drawerCloseStyles = () => ({
    transform: `translateX(${pxToRem(-320)})`,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    })
  });
  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",

      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
    },
  };
});
