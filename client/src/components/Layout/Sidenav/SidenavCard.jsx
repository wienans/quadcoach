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
import { useState } from "react"

// @mui material components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import Link from "@mui/material/Link";

// Soft UI Dashboard React components
import { SoftButton, SoftBox, SoftTypography } from "../../";

// Custom styles for the SidenavCard
import { card, cardContent, cardIconBox, cardIcon } from "./styles/sidenavCard";

// Soft UI Dashboard React context
// import { useSoftUIController } from "context";

function SidenavCard () {
  // const [controller] = useSoftUIController();
  // const { miniSidenav, sidenavColor } = controller;
  const [miniSidenav, setMiniSidenav] = useState(false)
  const [sidenavColor] = useState("info")

  return (
    <Card sx={(theme) => card(theme, { miniSidenav })}>
      <CardContent sx={(theme) => cardContent(theme, { sidenavColor })}>
        <SoftBox
          bgColor="white"
          width="2rem"
          height="2rem"
          borderRadius="md"
          shadow="md"
          mb={2}
          sx={cardIconBox}
        >
          <Icon fontSize="medium" sx={(theme) => cardIcon(theme, { sidenavColor })}>
            star
          </Icon>
        </SoftBox>
        <SoftBox lineHeight={1}>
          <SoftTypography variant="h6" color="white">
            Need help?
          </SoftTypography>
          <SoftBox mb={1.825} mt={-1}>
            <SoftTypography variant="caption" color="white" fontWeight="medium">
              Please check our docs
            </SoftTypography>
          </SoftBox>
          <SoftButton
            component={Link}
            href="https://github.com/app-generator/react-soft-ui-dashboard"
            target="_blank"
            rel="noreferrer"
            size="small"
            color="white"
            fullWidth
          >
            documentation
          </SoftButton>
        </SoftBox>
      </CardContent>
    </Card>
  );
}

export default SidenavCard;
