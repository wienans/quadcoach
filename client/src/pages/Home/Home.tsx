import "./translations";
import { Card } from "@mui/material";
import { SoftBox, SoftTypography } from "../../components";
// import { useTranslation } from "react-i18next";

import Logo from "../../assets/images/logo.png";
import { DashboardLayout } from "../../components/LayoutContainers";

const Home = () => {
  // const { t } = useTranslation("Home");

  return (
    <DashboardLayout>
      {() => (
        <>
          <SoftBox
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={Logo}
              alt="Logo"
              style={{ width: "128px", margin: "50px 0" }}
            />
          </SoftBox>
          <SoftBox>
            <Card sx={{ height: "100%" }}>
              <SoftBox p={2}>
                <SoftBox
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Beta Tesing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    12.Oct.2024
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  Tactic Board V2.0 which can be visualized in a Exercise and
                  Login / Registration implemented for Beta Testing
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
          <SoftBox mt={5} mb={3}>
            <Card sx={{ height: "100%" }}>
              <SoftBox p={2}>
                <SoftBox
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    Alpha Testing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    04.Feb.2024
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  Local Alpha Testing works well and we are constantly adding
                  new features
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
        </>
      )}
    </DashboardLayout>
  );
};

export default Home;
