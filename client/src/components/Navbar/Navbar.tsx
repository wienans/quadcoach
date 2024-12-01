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
// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

// Soft UI Dashboard React components
import { SoftBox, Breadcrumbs } from "..";

// Custom styles for DashboardNavbar
import Logo from "../../assets/images/logo.png";
import NavbarMainControls from "../NavbarMainControls";
//import BackButton from "./BackButton";

export type NavbarProps = {
  light: boolean;
};

const Navbar = ({ light }: NavbarProps) => (
  <AppBar position="relative" color="transparent">
    <Toolbar
      sx={{
        display: "flex",
        alignContent: "center",
      }}
    >
      {/* <BackButton
        sx={{
          flexGrow: 1,
          display: {
            xs: "flex",
            md: "none",
          },
        }}
        light={light}
      /> */}
      <SoftBox
        sx={{
          flexGrow: {
            xs: 1,
            md: 0,
          },
        }}
        component="a"
        href="/"
      >
        <img
          src={Logo}
          style={{
            filter: light
              ? "invert(100%) sepia(0%) saturate(7481%) hue-rotate(347deg) brightness(102%) contrast(100%)"
              : "invert(0%) sepia(0%) saturate(7500%) hue-rotate(347deg) brightness(105%) contrast(111%)",
            width: "50px",
          }}
        />
      </SoftBox>
      <SoftBox
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },
          ml: 1,
        }}
      >
        <Breadcrumbs light={light} />
      </SoftBox>
      <SoftBox
        sx={{
          marginLeft: "auto",
        }}
      >
        <NavbarMainControls light={light} />
      </SoftBox>
    </Toolbar>
  </AppBar>
);

export default Navbar;
