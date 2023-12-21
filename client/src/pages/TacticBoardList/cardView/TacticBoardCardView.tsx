import { Alert, Grid } from "@mui/material";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import TacticBoardLoadingCard from "./TacticBoardLoadingCard";
import TacticBoardCard from "./TacticBoardCard";

export type TacticBoardCardViewProps = {
  tacticBoards?: TacticBoard[];
  isTacticBoardsLoading: boolean;
  onOpenTacticBoardClick: (exerciseId: string) => void;
};

const TacticBoardCardView = ({
  tacticBoards,
  isTacticBoardsLoading,
  onOpenTacticBoardClick,
}: TacticBoardCardViewProps): JSX.Element => {
  const { t } = useTranslation("TacticBoardList");

  if ((tacticBoards?.length ?? 0) < 1 && !isTacticBoardsLoading) {
    return (
      <Alert color="info">{t("TacticBoardList:noTacticBoardsFound")}</Alert>
    );
  }

  return (
    <Grid container spacing={1}>
      {isTacticBoardsLoading &&
        Array.from(Array(10).keys()).map((loadingNumber) => (
          <Grid item xs={12} md={6} xl={4} xxl={3} key={loadingNumber}>
            <TacticBoardLoadingCard />
          </Grid>
        ))}
      {!isTacticBoardsLoading &&
        tacticBoards?.map((tacticBoard) => {
          if (tacticBoard.isPrivate != true) {
            return (
              <Grid item xs={12} md={6} xl={4} xxl={3} key={tacticBoard._id}>
                <TacticBoardCard
                  tacticBoard={tacticBoard}
                  onOpenTacticBoardClick={() =>
                    onOpenTacticBoardClick(tacticBoard._id)
                  }
                />
              </Grid>
            );
          }
        })}
    </Grid>
  );
};

export default TacticBoardCardView;
