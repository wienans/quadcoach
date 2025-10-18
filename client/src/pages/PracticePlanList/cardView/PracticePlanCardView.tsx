import { Alert, Grid } from "@mui/material";
import { PracticePlanHeader } from "../../../api/quadcoachApi/domain/PracticePlan";
import { useTranslation } from "react-i18next";
import PracticePlanLoadingCard from "./PracticePlanLoadingCard";
import PracticePlanCard from "./PracticePlanCard";

export type PracticePlanCardViewProps = {
  practicePlans?: PracticePlanHeader[];
  isPracticePlansLoading: boolean;
  onOpenPracticePlanClick: (practicePlanId: string) => void;
};

const PracticePlanCardView = ({
  practicePlans,
  isPracticePlansLoading,
  onOpenPracticePlanClick,
}: PracticePlanCardViewProps): JSX.Element => {
  const { t } = useTranslation("PracticePlanList");

  if ((practicePlans?.length ?? 0) < 1 && !isPracticePlansLoading) {
    return (
      <Alert color="info">{t("PracticePlanList:noPracticePlansFound")}</Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      {isPracticePlansLoading &&
        Array.from(Array(10).keys()).map((loadingNumber) => (
          <Grid item xs={12} md={6} xl={4} xxl={3} key={loadingNumber}>
            <PracticePlanLoadingCard />
          </Grid>
        ))}
      {!isPracticePlansLoading &&
        practicePlans?.map((practicePlan) => {
          return (
            <Grid item xs={12} md={6} xl={4} xxl={3} key={practicePlan._id}>
              <PracticePlanCard
                practicePlan={practicePlan}
                onOpenPracticePlanClick={() =>
                  onOpenPracticePlanClick(practicePlan._id)
                }
              />
            </Grid>
          );
        })}
    </Grid>
  );
};

export default PracticePlanCardView;