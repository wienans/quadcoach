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
import "./translations";

import { useState, useEffect, MouseEvent } from "react";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, Breadcrumbs, SoftTypography } from "../../..";

// Custom styles for DashboardNavbar
import { navbar, navbarContainer, navbarRow } from "./styles";

import TranslateIcon from "@mui/icons-material/Translate";

// import AuthApi from "../../../api/auth";
import { createSelector } from "@reduxjs/toolkit";
import { setTransparentNavbar } from "../../../Layout/layoutSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { RootState } from "../../../../store/store";
import Logo from "../../../../assets/images/firstLogo.svg";
import NavbarMainControls from "../../../NavbarMainControls";
import QuickNavigation from "./QuickNavigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BackButton from "./BackButton";

// create a selector when selecting two or properties at once for better performance
const selectMiniSidenav = (state: RootState) => state.layout.miniSidenav;
const selectTransparentNavbar = (state: RootState) =>
  state.layout.transparentNavbar;
const selectFixedNavbar = (state: RootState) => state.layout.fixedNavbar;
const selectOpenSettingsMenu = (state: RootState) =>
  state.layout.openSettingsMenu;
const dashboardNavbarSelector = createSelector(
  selectMiniSidenav,
  selectTransparentNavbar,
  selectFixedNavbar,
  selectOpenSettingsMenu,
  (miniSidenav, transparentNavbar, fixedNavbar, openSettingsMenu) => ({
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openSettingsMenu,
  }),
);

export type DashboardNavbarProps = {
  absolute: boolean;
  light: boolean;
};

const DashboardNavbar = ({ absolute, light }: DashboardNavbarProps) => {
  const dispatch = useAppDispatch();
  const [navbarType, setNavbarType] = useState<
    "fixed" | "absolute" | "sticky" | "static" | "relative" | undefined
  >();
  const { transparentNavbar, fixedNavbar } = useAppSelector(
    dashboardNavbarSelector,
  );

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      dispatch(
        setTransparentNavbar(
          (fixedNavbar && window.scrollY === 0) || !fixedNavbar,
        ),
      );
    }

    /** 
         The event listener that's calling the handleTransparentNavbar function when 
         scrolling the window.
        */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);
  console.log("absolute", absolute ? "y" : "n");
  return (
    <AppBar
      position={"relative"}
      color="transparent"
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <BackButton
          sx={{
            flexGrow: 1,
            display: {
              xs: "flex",
              md: "none",
            },
          }}
        />
        <SoftBox
          sx={{
            flexGrow: {
              xs: 1,
              md: 0,
            },
          }}
        >
          <img src={Logo} />
        </SoftBox>
        <SoftBox
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },
            ml: 1,
            // flexGrow: 1,
          }}
        >
          <Breadcrumbs />
          {/* <QuickNavigation /> */}
        </SoftBox>
        <SoftBox
          sx={{
            marginLeft: "auto",
          }}
        >
          <NavbarMainControls />
        </SoftBox>
      </Toolbar>
    </AppBar>
  );
};

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

export default DashboardNavbar;
