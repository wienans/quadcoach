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

import { useState, useEffect } from "react";

// react-router components
import { useLocation, Link } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography, SoftInput, Breadcrumbs, NotificationItem } from "../"

// import { useAuth } from "../../../auth-context/auth.context";

// Custom styles for DashboardNavbar
import {
    navbar,
    navbarContainer,
    navbarRow,
    navbarIconButton,
    navbarMobileMenu,
} from "./styles";

// Images
import team2 from "../../assets/images/team-2.jpg";
import logoSpotify from "../../assets/images/small-logos/logo-spotify.svg";

// import AuthApi from "../../../api/auth";
import { useNavigate } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { setMiniSideNav, setOpenSettingsMenu, setTransparentNavbar } from "../Layout/layoutSlice";

// create a selector when selecting two or properties at once for better performance
const selectMiniSidenav = state => state.layout.miniSidenav;
const selectTransparentNavbar = state => state.layout.transparentNavbar;
const selectFixedNavbar = state => state.layout.fixedNavbar;
const selectOpenSettingsMenu = state => state.layout.openSettingsMenu;
const dashboardNavbarSelector = createSelector(
    selectMiniSidenav,
    selectTransparentNavbar,
    selectFixedNavbar,
    selectOpenSettingsMenu,
    (miniSidenav, transparentNavbar, fixedNavbar, openSettingsMenu) => ({
        miniSidenav,
        transparentNavbar,
        fixedNavbar,
        openSettingsMenu
    })
)

function DashboardNavbar ({ absolute, light, isMini }) {
    const dispatch = useDispatch();
    const [navbarType, setNavbarType] = useState();
    const { miniSidenav, transparentNavbar, fixedNavbar, openSettingsMenu } = useSelector(dashboardNavbarSelector)

    const [openMenu, setOpenMenu] = useState(false);
    const route = useLocation().pathname.split("/").slice(1);

    useEffect(() => {
        // Setting the navbar type
        if (fixedNavbar) {
            setNavbarType("sticky");
        } else {
            setNavbarType("static");
        }

        // A function that sets the transparent state of the navbar.
        function handleTransparentNavbar () {
            dispatch(setTransparentNavbar((fixedNavbar && window.scrollY === 0) || !fixedNavbar));
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

    const handleMiniSidenav = () => { dispatch(setMiniSideNav(!miniSidenav)) }
    const handleConfiguratorOpen = () => { dispatch(setOpenSettingsMenu(!openSettingsMenu)) }
    const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
    const handleCloseMenu = () => setOpenMenu(false);

    // Render the notifications menu
    const renderMenu = () => (
        <Menu
            anchorEl={openMenu}
            anchorReference={null}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={Boolean(openMenu)}
            onClose={handleCloseMenu}
            sx={{ mt: 2 }}
        >
            <NotificationItem
                image={<img src={team2} alt="person" />}
                title={["New message", "from Laur"]}
                date="13 minutes ago"
                onClick={handleCloseMenu}
            />
            <NotificationItem
                image={<img src={logoSpotify} alt="person" />}
                title={["New album", "by Travis Scott"]}
                date="1 day"
                onClick={handleCloseMenu}
            />
            <NotificationItem
                color="secondary"
                image={
                    <Icon fontSize="small" sx={{ color: ({ palette: { white } }) => white.main }}>
                        payment
                    </Icon>
                }
                title={["", "Payment successfully completed"]}
                date="2 days"
                onClick={handleCloseMenu}
            />
        </Menu>
    );

    return (
        <AppBar
            position={absolute ? "absolute" : navbarType}
            color="inherit"
            sx={(theme) => navbar(theme, { transparentNavbar, absolute, light })}
        >
            <Toolbar sx={(theme) => navbarContainer(theme)}>
                <SoftBox color="inherit" mb={{ xs: 1, md: 0 }} sx={(theme) => navbarRow(theme, { isMini })}>
                    <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
                </SoftBox>
                {isMini ? null : (
                    <SoftBox sx={(theme) => navbarRow(theme, { isMini })}>
                        <SoftBox pr={1}>
                            <SoftInput
                                placeholder="Type here..."
                                icon={{ component: "search", direction: "left" }}
                            />
                        </SoftBox>
                        <SoftBox color={light ? "white" : "inherit"}>
                            <IconButton
                                size="small"
                                color="inherit"
                                sx={navbarMobileMenu}
                                onClick={handleMiniSidenav}
                            >
                                <Icon className={light ? "text-white" : "text-dark"}>
                                    {miniSidenav ? "menu_open" : "menu"}
                                </Icon>
                            </IconButton>
                            <IconButton
                                size="small"
                                color="inherit"
                                sx={navbarIconButton}
                                onClick={handleConfiguratorOpen}
                            >
                                <Icon>settings</Icon>
                            </IconButton>
                            <IconButton
                                size="small"
                                color="inherit"
                                sx={navbarIconButton}
                                aria-controls="notification-menu"
                                aria-haspopup="true"
                                variant="contained"
                                onClick={handleOpenMenu}
                            >
                                <Icon className={light ? "text-white" : "text-dark"}>notifications</Icon>
                            </IconButton>
                            {renderMenu()}
                        </SoftBox>
                    </SoftBox>
                )}
            </Toolbar>
        </AppBar>
    );
}

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
