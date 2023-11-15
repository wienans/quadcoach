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

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, SoftInput, Breadcrumbs } from "..";

// Custom styles for DashboardNavbar
import { navbar, navbarContainer, navbarRow } from "./styles";

import TranslateIcon from "@mui/icons-material/Translate";

// import AuthApi from "../../../api/auth";
import { createSelector } from "@reduxjs/toolkit";
import { setMiniSideNav, setTransparentNavbar } from "../Layout/layoutSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store/store";
import { MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

type Language = {
  code: string;
  label: string;
};

const languages: Language[] = [
  {
    code: "de",
    label: "Deutsch",
  },
  {
    code: "en",
    label: "English",
  },
];

// create a selector when selecting two or properties at once for better performance
const selectMiniSidenav = (state: RootState) => state.layout.miniSidenav;
const selectTransparentNavbar = (state: RootState) =>
  state.layout.transparentNavbar;
const selectFixedNavbar = (state: RootState) => state.layout.fixedNavbar;
const selectOpenSettingsMenu = (state: RootState) =>
  state.layout.openSettingsMenu;
const selectBreadcrumbs = (state: RootState) => state.layout.breadcrumbs;
const dashboardNavbarSelector = createSelector(
  selectMiniSidenav,
  selectTransparentNavbar,
  selectFixedNavbar,
  selectOpenSettingsMenu,
  selectBreadcrumbs,
  (
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openSettingsMenu,
    breadcrumbs,
  ) => ({
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openSettingsMenu,
    breadcrumbs,
  }),
);

export type DashboardNavbarProps = {
  absolute: boolean;
  light: boolean;
  isMini: boolean;
};

const DashboardNavbar = ({ absolute, light, isMini }: DashboardNavbarProps) => {
  const dispatch = useAppDispatch();
  const { i18n, t } = useTranslation();
  const [navbarType, setNavbarType] = useState<
    "fixed" | "absolute" | "sticky" | "static" | "relative" | undefined
  >();
  const { miniSidenav, transparentNavbar, fixedNavbar, breadcrumbs } =
    useAppSelector(dashboardNavbarSelector);

  const [openLangugageMenu, setOpenLanguageMenu] = useState<
    HTMLButtonElement | undefined
  >();

  const currentLanguageCode =
    languages.find((language) => language.code === i18n.language)?.code ??
    languages[0].code;

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

  const handleMiniSidenav = () => {
    dispatch(setMiniSideNav(!miniSidenav));
  };
  // const handleConfiguratorOpen = () => { dispatch(setOpenSettingsMenu(!openSettingsMenu)) }
  const handleOpenLanguageMenu = (event: MouseEvent<HTMLButtonElement>) =>
    setOpenLanguageMenu(event.currentTarget);
  const handleCloseLanguageMenu = () => {
    setOpenLanguageMenu(undefined);
  };

  const handleLanguageMenuItemClicked = (newLanguageCode: string) => () => {
    i18n.changeLanguage(newLanguageCode);
    handleCloseLanguageMenu();
  };

  // Render the notifications menu
  const renderLanguageMenu = () => (
    <Menu
      anchorEl={openLangugageMenu}
      anchorReference={undefined}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openLangugageMenu)}
      onClose={handleCloseLanguageMenu}
      sx={{ mt: 2 }}
    >
      {languages.map((language) => (
        <MenuItem
          key={language.code}
          selected={language.code === currentLanguageCode}
          disabled={language.code === currentLanguageCode}
          onClick={handleLanguageMenuItemClicked(language.code)}
        >
          {language.label}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        {breadcrumbs ? (
          <SoftBox
            color="inherit"
            mb={{ xs: 1, md: 0 }}
            sx={(theme) => navbarRow(theme, { isMini })}
          >
            <Breadcrumbs
              icon="home"
              title={breadcrumbs.title}
              routes={breadcrumbs.routes}
              light={light}
            />
          </SoftBox>
        ) : (
          <SoftBox />
        )}
        {isMini ? null : (
          <SoftBox sx={(theme) => navbarRow(theme, { isMini })}>
            <SoftBox pr={1}>
              <SoftInput
                placeholder={t("DashboardNavbar:searchBox.placeholder")}
                icon={{ component: "search", direction: "left" }}
              />
            </SoftBox>
            <SoftBox color={light ? "white" : "inherit"}>
              <IconButton
                size="small"
                color="inherit"
                onClick={handleOpenLanguageMenu}
              >
                <TranslateIcon />
              </IconButton>
              <IconButton
                size="small"
                color="inherit"
                onClick={handleMiniSidenav}
              >
                <Icon className={light ? "text-white" : "text-dark"}>
                  {miniSidenav ? "menu_open" : "menu"}
                </Icon>
              </IconButton>
              {renderLanguageMenu()}
            </SoftBox>
          </SoftBox>
        )}
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

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
