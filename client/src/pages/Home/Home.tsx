import "./translations";
import { Card } from "@mui/material";
import { SoftBox, SoftTypography } from "../../components";
// import { useTranslation } from "react-i18next";

import Logo from "../../assets/images/logo.png";
import { DashboardLayout } from "../../components/LayoutContainers";
import Footer from "../../components/Footer";

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
                    Favorite Lists and User Profile
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    01.Dec.2024
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  As new Features i added Favorite Lists for Tacticboards and
                  Exercises which can be viewed in the new User Profile, where
                  you also can edit your User Information. For now it is not
                  pretty but it does its job.
                  <br />
                  As a next Feature i am working on letting multiple users edit
                  the same Tacticboard or Exercise and in case of Private
                  Tacticboards setting viewer access for users.
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
          <SoftBox mt={5}>
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
                    Open Beta Testing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    03.Nov.2024
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  Performance improvements for saving and loading tacticboards,
                  and overall backend improvements.
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
          <SoftBox mt={5}>
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
                    Beta Testing
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
          <Footer />
        </>
      )}
    </DashboardLayout>
  );
};

export default Home;
