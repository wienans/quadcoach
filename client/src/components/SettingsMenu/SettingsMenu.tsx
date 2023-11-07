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
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// @mui icons
import GitHubIcon from "@mui/icons-material/GitHub";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography, SoftButton } from "..";

// Custom styles for the Configurator
import SettingsMenuRoot from "./SettingsMenuRoot";
import { setOpenSettingsMenu } from "../Layout/layoutSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const SettingsMenu = () => {
  const dispatch = useAppDispatch();
  const openSettingsMenu = useAppSelector(
    (state) => state.layout.openSettingsMenu,
  );

  const handleCloseConfigurator = () => dispatch(setOpenSettingsMenu(false));

  return (
    <SettingsMenuRoot variant="permanent" ownerState={{ openSettingsMenu }}>
      <SoftBox
        display="flex"
        justifyContent="space-between"
        alignItems="baseline"
        pt={3}
        pb={0.8}
        px={3}
      >
        <SoftBox>
          <SoftTypography variant="h5">Einstellungen</SoftTypography>
        </SoftBox>

        <Icon
          sx={({
            typography: { size, fontWeightBold },
            palette: { dark },
          }) => ({
            fontSize: `${size.md} !important`,
            fontWeight: `${fontWeightBold} !important`,
            stroke: dark.main,
            strokeWidth: "2px",
            cursor: "pointer",
            mt: 2,
          })}
          onClick={handleCloseConfigurator}
        >
          close
        </Icon>
      </SoftBox>

      <Divider />

      <SoftBox pt={1.25} pb={3} px={3}>
        <SoftBox textAlign="center">
          <SoftBox mb={0.5}>
            <SoftTypography variant="h6">
              Thank you for using QuadCoach!
            </SoftTypography>
          </SoftBox>

          <SoftBox display="flex" justifyContent="center">
            <SoftBox>
              <SoftButton
                component={Link}
                href="https://github.com/wienans/quadcoach"
                target="_blank"
                rel="noreferrer"
                color="dark"
              >
                <GitHubIcon />
                &nbsp; Github
              </SoftButton>
            </SoftBox>
          </SoftBox>
        </SoftBox>
      </SoftBox>
    </SettingsMenuRoot>
  );
};

export default SettingsMenu;
