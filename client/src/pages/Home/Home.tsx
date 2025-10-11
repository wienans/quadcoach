import "./translations";
import { Card, Button } from "@mui/material";
import { SoftBox, SoftTypography } from "../../components";
// import { useTranslation } from "react-i18next";

import Logo from "../../assets/images/logo.png";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useCreatePracticePlanMutation } from "../../api/quadcoachApi/practicePlansApi";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [createPlan, { isLoading: creatingPlan }] = useCreatePracticePlanMutation();
  const handleCreateDebugPlan = async () => {
    try {
      const result = await createPlan({ name: `Debug Plan ${new Date().toISOString()}` }).unwrap();
      navigate(`/practice-plans/${result._id}`);
    } catch (e) {
      // swallow for debug; could add toast
       
      console.error("Failed to create debug practice plan", e);
    }
  };
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
                    Drafting Boards
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
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
                    Multi-User Access & System Improvements
                  </SoftTypography>
                  <SoftTypography
                    variant="h3"
                    fontWeight="bold"
                    textTransform="uppercase"
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
          {import.meta.env.DEV && (
            <SoftBox mt={5}>
              <Card sx={{ height: "100%" }}>
                <SoftBox p={2} display="flex" flexDirection="column" gap={2}>
                  <SoftTypography variant="h5" fontWeight="bold">
                    Debug Utilities
                  </SoftTypography>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleCreateDebugPlan}
                    disabled={creatingPlan}
                  >
                    {creatingPlan ? "Creating Practice Plan..." : "Create Practice Plan (Debug)"}
                  </Button>
                </SoftBox>
              </Card>
            </SoftBox>
          )}
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
