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

import { ReactNode } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Soft UI Dashboard React components
import { SoftTypography, SoftBox } from "../..";

// Soft UI Dashboard React examples
import SidenavCollapse from "./SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "./SidenavRoot";
import { createSelector } from "@reduxjs/toolkit";
import { setMiniSideNav } from "../layoutSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { RootState } from "../../../store/store";
import { DrawerProps, Palette, PaletteColor } from "@mui/material";
import { PickByType } from "../../../helpers/typeHelpers";
import { useTranslation } from "react-i18next";
import Logo from "../../../assets/images/logo.png";

// Soft UI Dashboard React context
// import { useSoftUIController, setMiniSidenav } from "context";

// create a selector when selecting two or properties at once for better performance
const selectMiniSidenav = (state: RootState) => state.layout.miniSidenav;
const selectTransparentSidenav = (state: RootState) =>
  state.layout.transparentSidenav;
const sidenavSelector = createSelector(
  selectMiniSidenav,
  selectTransparentSidenav,
  (miniSidenav, transparentSidenav) => ({
    miniSidenav,
    transparentSidenav,
  }),
);

type SidebarNavRouteCollapse = {
  type: "collapse";
  key: string;
  href?: string;
  route?: string;
  nameResourceKey: string;
  icon: ReactNode;
  noCollapse?: boolean;
  regExp?: RegExp;
  /**
   * Currently not used, later for routes, which can only be called by authenticated user.
   */
  protected?: boolean;
};

function isSidebarNavRouteCollapse<T>(
  route: T | SidebarNavRouteCollapse,
): route is SidebarNavRouteCollapse {
  return (route as SidebarNavRouteCollapse).type === "collapse";
}

type SidebarNavRouteDivider = {
  type: "divider";
  key: string;
};

function isSidebarNavRouteDivider<T>(
  route: T | SidebarNavRouteDivider,
): route is SidebarNavRouteDivider {
  return (route as SidebarNavRouteDivider).type === "divider";
}

type SidebarNavRouteTitle = {
  type: "title";
  key: string;
  titleResourceKey: string;
};

function isSidebarNavRouteTitle<T>(
  route: T | SidebarNavRouteTitle,
): route is SidebarNavRouteTitle {
  return (route as SidebarNavRouteTitle).type === "title";
}

export type SidebarNavRoute =
  | SidebarNavRouteCollapse
  | SidebarNavRouteDivider
  | SidebarNavRouteTitle;

export interface SidenavProps extends Omit<DrawerProps, "color"> {
  color: keyof PickByType<Palette, PaletteColor>;
  routes: SidebarNavRoute[];
}

const Sidenav = ({ color, routes, ...rest }: SidenavProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { miniSidenav } = useAppSelector(sidenavSelector);
  const location = useLocation();
  const { pathname } = location;
  const collapseName = pathname.split("/").slice(1)[0];

  const closeSidenav = () => dispatch(setMiniSideNav(true));

  const isRoutePropsActive = (key: string, regExp?: RegExp) =>
    regExp ? regExp.test(pathname) : key === collapseName;

  const renderCollapseRoute = ({
    href,
    route,
    key,
    nameResourceKey,
    icon,
    noCollapse,
    regExp,
  }: SidebarNavRouteCollapse): JSX.Element | undefined => {
    const isActive = isRoutePropsActive(key, regExp);

    if (href) {
      return (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            color={color}
            name={t(nameResourceKey)}
            icon={icon}
            active={isActive}
            noCollapse={noCollapse}
          />
        </Link>
      );
    }

    if (route) {
      return (
        <NavLink to={route} key={key} onClick={closeSidenav}>
          <SidenavCollapse
            color={color}
            key={key}
            name={t(nameResourceKey)}
            icon={icon}
            active={isActive}
            noCollapse={noCollapse}
          />
        </NavLink>
      );
    }
  };

  const renderTitleRoute = ({
    titleResourceKey,
    key,
  }: SidebarNavRouteTitle) => {
    return (
      <SoftTypography
        key={key}
        display="block"
        variant="caption"
        fontWeight="bold"
        textTransform="uppercase"
        opacity={0.6}
        pl={3}
        mt={2}
        mb={1}
        ml={1}
      >
        {t(titleResourceKey)}
      </SoftTypography>
    );
  };

  const renderDividerRoute = ({
    key,
  }: SidebarNavRouteDivider): JSX.Element | undefined => {
    return <Divider key={key} />;
  };

  const renderRoute = (route: SidebarNavRoute): JSX.Element | undefined => {
    if (isSidebarNavRouteCollapse(route)) return renderCollapseRoute(route);

    if (isSidebarNavRouteTitle(route)) return renderTitleRoute(route);

    if (isSidebarNavRouteDivider(route)) return renderDividerRoute(route);
  };

  return (
    <SidenavRoot {...rest} variant="permanent" ownerState={{ miniSidenav }}>
      <SoftBox pt={3} pb={1} px={4} textAlign="center">
        <SoftBox
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <SoftTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </SoftTypography>
        </SoftBox>
        <SoftBox
          component={NavLink}
          to="/"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <SoftBox
            component="img"
            src={Logo}
            alt="QuadCoach Logo"
            style={{ width: "50px" }}
          />
        </SoftBox>
      </SoftBox>
      <Divider />
      <List>{routes.map((route) => renderRoute(route))}</List>
    </SidenavRoot>
  );
};

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

export default Sidenav;
