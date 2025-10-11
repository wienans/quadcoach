import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useTranslation } from "react-i18next";
import { Theme, useMediaQuery } from "@mui/material";

const PracticePlanner = (): JSX.Element => {
  const { t } = useTranslation("ExerciseList");
  const navigate = useNavigate();

  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  return (
    <DashboardLayout
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
    >
      {(scrollTrigger) => <p></p>}
    </DashboardLayout>
  );
};

export default PracticePlanner;
