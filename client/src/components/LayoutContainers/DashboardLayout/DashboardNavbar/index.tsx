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
import { SoftBox, Breadcrumbs } from "../../..";

// Custom styles for DashboardNavbar
import Logo from "../../../../assets/images/firstLogo.svg";
import NavbarMainControls from "../../../NavbarMainControls";
import BackButton from "./BackButton";

const DashboardNavbar = () => (
  <AppBar position={"relative"} color="transparent">
    <Toolbar
      sx={{
        display: "flex",
        alignContent: "center",
      }}
    >
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
        }}
      >
        <Breadcrumbs />
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

export default DashboardNavbar;
