import "../TacticBoardProfile/translations";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  Chip,
  Skeleton,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import { SoftBox, SoftTypography } from "../../components";
import TacticBoardInProfileWrapper from "../TacticBoardProfile/TacticBoardInProfile";
import { useGetSharedTacticBoardQuery } from "../../api/quadcoachApi/tacticboardApi";
import Footer from "../../components/Footer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { lazy, Suspense } from "react";
const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

const SharedTacticBoard = (): JSX.Element => {
  const { token } = useParams();
  const { t: tProfile } = useTranslation("TacticBoardProfile");

  const {
    data: tacticBoard,
    isError,
    isLoading,
  } = useGetSharedTacticBoardQuery(token || "", {
    skip: !token,
  });

  if (!token) {
    return (
      <DashboardLayout>
        {() => (
          <Alert severity="error">{tProfile("errorTacticBoardNotFound")}</Alert>
        )}
      </DashboardLayout>
    );
  }

  return (
    <ProfileLayout title={tacticBoard?.name}>
      {() => (
        <>
          {isLoading && (
            <Skeleton variant="rectangular" width="100%" height={120} />
          )}
          {isError && !isLoading && (
            <Alert severity="error">
              {tProfile("errorLoadingTacticBoard")}
            </Alert>
          )}
          {tacticBoard && (
            <>
              <SoftBox mt={2}>
                <Card sx={{ height: "100%" }}>
                  <TacticBoardInProfileWrapper
                    tacticBoardId={undefined}
                    sharedToken={token}
                    isEditMode={false}
                  />
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {tProfile("info.title")}
                    </AccordionSummary>
                    <AccordionDetails sx={{ ml: 1 }}>
                      <SoftTypography variant="body2">
                        {tProfile("info.tags.label")}
                      </SoftTypography>

                      <div>
                        {tacticBoard.tags &&
                          tacticBoard.tags.length > 0 &&
                          tacticBoard.tags.map((el, index) => {
                            if (el != "") {
                              return (
                                <Chip
                                  size="small"
                                  key={el + index}
                                  label={el}
                                  sx={{ margin: "2px" }}
                                  variant={"outlined"}
                                />
                              );
                            }
                          })}
                        {tacticBoard.tags?.length == 0 &&
                          tProfile("info.tags.none")}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  {tacticBoard.description && (
                    <SoftBox mt={2}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          {tProfile("description")}
                        </AccordionSummary>
                        <AccordionDetails sx={{ ml: 1 }}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <MarkdownRenderer>
                              {tacticBoard?.description ?? ""}
                            </MarkdownRenderer>
                          </Suspense>
                        </AccordionDetails>
                      </Accordion>
                    </SoftBox>
                  )}
                  {tacticBoard.coaching_points && (
                    <SoftBox mt={2}>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          {tProfile("coaching_points")}
                        </AccordionSummary>
                        <AccordionDetails sx={{ ml: 1 }}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <MarkdownRenderer>
                              {tacticBoard?.coaching_points ?? ""}
                            </MarkdownRenderer>
                          </Suspense>
                        </AccordionDetails>
                      </Accordion>
                    </SoftBox>
                  )}
                </Card>
              </SoftBox>
            </>
          )}
          <Footer />
        </>
      )}
    </ProfileLayout>
  );
};

export default SharedTacticBoard;
