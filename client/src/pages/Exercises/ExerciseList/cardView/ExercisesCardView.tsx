import {
  Alert,
  BottomNavigation,
  BottomNavigationAction,
  Fade,
  Grid,
  Icon,
  Paper,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { Exercise } from "../../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import ExerciseLoadingCard from "./ExerciseLoadingCard";
import ExerciseCard from "./ExerciseCard";
import AddIcon from "@mui/icons-material/Add";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { setMiniSideNav } from "../../../../components/Layout/layoutSlice";
import { useAuth } from "../../../../store/hooks";

export type ExercisesCardViewProps = {
  exercises?: Exercise[];
  isExercisesLoading: boolean;
  onOpenExerciseClick: (exerciseId: string) => void;
  scrollTrigger: boolean;
};

const ExercisesCardView = ({
  exercises,
  isExercisesLoading,
  onOpenExerciseClick,
  scrollTrigger,
}: ExercisesCardViewProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("ExerciseList");
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const { status: userStatus } = useAuth();
  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);
  const handleMiniSidenav = () => {
    dispatch(setMiniSideNav(!miniSidenav));
  };

  if ((exercises?.length ?? 0) < 1 && !isExercisesLoading) {
    return <Alert color="info">{t("ExerciseList:noExercisesFound")}</Alert>;
  }

  return (
    <>
      <Grid container spacing={1} sx={{ mb: { sm: 2, md: undefined } }}>
        {isExercisesLoading
          ? Array.from(Array(10).keys()).map((loadingNumber) => (
              <Grid item xs={12} md={6} xl={4} xxl={3} key={loadingNumber}>
                <ExerciseLoadingCard />
              </Grid>
            ))
          : exercises?.map((exercise) => (
              <Grid item xs={12} md={6} xl={4} xxl={3} key={exercise._id}>
                <ExerciseCard
                  exercise={exercise}
                  onOpenExerciseClick={() => onOpenExerciseClick(exercise._id)}
                />
              </Grid>
            ))}
      </Grid>
      {!isUpMd && (
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation showLabels={false}>
            <BottomNavigationAction
              icon={<Icon>{miniSidenav ? "menu_open" : "menu"}</Icon>}
              onClick={handleMiniSidenav}
            />
            {userStatus != null && (
              <BottomNavigationAction
                icon={<AddIcon />}
                href="/exercises/add"
              />
            )}
            {scrollTrigger && (
              <Fade in={scrollTrigger}>
                <BottomNavigationAction
                  icon={<ArrowCircleUpIcon />}
                  onClick={() => window.scrollTo(0, 0)}
                />
              </Fade>
            )}
          </BottomNavigation>
        </Paper>
      )}
    </>
  );
};

export default ExercisesCardView;
