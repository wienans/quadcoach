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
            <SoftBox
              component="img"
              src={Logo}
              alt="Logo"
              sx={{
                width: { xs: "80px", sm: "100px", md: "128px" },
                margin: { xs: "30px 0", sm: "40px 0", md: "50px 0" },
              }}
            />
          </SoftBox>
          <SoftBox>
            <Card sx={{ height: "100%" }}>
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Drafting Boards
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
                  >
                    24.Aug.2025
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  This non-persistent workspace allows coaches to quickly sketch
                  tactical ideas.
                  <br />
                  Perfect for brainstorming sessions, temporary demonstrations,
                  and quick tactical explanations, or ingame coaching.
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
          <SoftBox mt={5}>
            <Card sx={{ height: "100%" }}>
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Multi-User Access & System Improvements
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
                  >
                    17.Jul.2025
                  </SoftTypography>
                </SoftBox>
                <SoftTypography>
                  As a new Main Feature i added the posibility for Creators of a
                  Tacticboard or Exercise to add additional persons to edit /
                  view it.
                  <br />
                  Second of all i reworked a bunch of stuff in the background
                  for Tacticboards, you can now remove and add inbetween pages
                  and have some keyboard control.
                </SoftTypography>
              </SoftBox>
            </Card>
          </SoftBox>
          <SoftBox mt={5}>
            <Card sx={{ height: "100%" }}>
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Favorite Lists and User Profile
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
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
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Open Beta Testing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
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
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Beta Testing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
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
              <SoftBox p={{ xs: 1.5, sm: 2 }}>
                <SoftBox
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  justifyContent={{ xs: "flex-start", sm: "space-between" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  width="100%"
                  gap={{ xs: 1, sm: 0 }}
                >
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    Alpha Testing
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="text"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem", md: "2rem" },
                      color: { xs: "text.secondary", sm: "inherit" },
                    }}
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
