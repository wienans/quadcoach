import "./translations";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Theme,
  BottomNavigationAction,
} from "@mui/material";
import { SoftBox, SoftButton } from "../../../../components";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
} from "../../../exerciseApi";
import { useTranslation } from "react-i18next";
import { ProfileLayout } from "../../../../components/LayoutContainers";
import { getExerciseTypeHeaderBackgroundImage } from "../../../../components/LayoutContainers/ProfileLayout";
import {
  ExerciseType,
  getExerciseType,
} from "../../../../helpers/exerciseHelpers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExerciseBlock from "./ExerciseBlock";
import ExerciseInfo from "./ExerciseInfo";

const Exercise = () => {
  const { t } = useTranslation("Exercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const isUpXl = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const {
    data: exercise,
    isLoading: isExerciseLoading,
    isError: isExerciseError,
  } = useGetExerciseQuery(exerciseId || "", {
    skip: exerciseId == null,
  });

  const {
    data: relatedExercises,
    isLoading: isRelatedExercisesLoading,
    isError: isRelatedExercisesError,
  } = useGetRelatedExercisesQuery(exerciseId || "", {
    skip: exerciseId == null,
  });

  const [exerciseType, setExerciseType] = useState<ExerciseType | undefined>();
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<
    string | undefined
  >();

  useEffect(() => {
    setExerciseType(exercise ? getExerciseType(exercise) : undefined);
  }, [exercise]);

  useEffect(() => {
    setHeaderBackgroundImage(
      exerciseType && exercise
        ? getExerciseTypeHeaderBackgroundImage(exerciseType, theme)
        : undefined,
    );
  }, [exercise, exerciseType, theme]);

  const update = async () => {
    navigate(`/exercises/${exerciseId}/update`);
  };

  const [
    deleteExercise,
    {
      isError: isDeleteExerciseError,
      isLoading: isDeleteExerciseLoading,
      isSuccess: isDeleteExerciseSuccess,
    },
  ] = useDeleteExerciseMutation();
  const onDeleteExerciseClick = () => {
    if (!exercise) return;
    deleteExercise(exercise._id);
  };
  useEffect(() => {
    if (!isDeleteExerciseSuccess) return;
    navigate("/exercises");
  }, [isDeleteExerciseSuccess, navigate]);

  const handleOpenExerciseClick = (id: string) => {
    navigate(`/exercises/${id}`);
  };

  if (isExerciseLoading) {
    return (
      <>
        <Card>
          <Skeleton variant="rectangular" width={"100%"} height={120} />
        </Card>
        <SoftBox mt={5} mb={3}>
          <Skeleton variant="rectangular" width={"100%"} height={120} />
        </SoftBox>
        <SoftBox mt={5} mb={3}>
          <Skeleton variant="rectangular" width={"100%"} height={120} />
        </SoftBox>
        <SoftBox mt={5} mb={3}>
          <Skeleton variant="rectangular" width={"100%"} height={120} />
        </SoftBox>
      </>
    );
  }

  if (!exercise || isExerciseError) {
    return <Alert color="error">{t("Exercise:errorLoadingExercise")}</Alert>;
  }

  return (
    <ProfileLayout
      title={exercise?.name}
      headerBackgroundImage={headerBackgroundImage}
      isDataLoading={isExerciseLoading}
      headerAction={
        <SoftBox display="flex">
          {isUpXl ? (
            <>
              <SoftButton onClick={update} color="primary" sx={{ mr: 1 }}>
                {t("Exercise:updateExercise")}
              </SoftButton>
              <SoftButton
                onClick={onDeleteExerciseClick}
                color="error"
                disabled={!exercise || isDeleteExerciseLoading}
              >
                {t("Exercise:deleteExercise")}
              </SoftButton>
            </>
          ) : (
            isUpMd && (
              <>
                <Tooltip title={t("Exercise:updateExercise")}>
                  <IconButton onClick={update} color="primary" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Exercise:deleteExercise")}>
                  <IconButton
                    onClick={onDeleteExerciseClick}
                    color="error"
                    disabled={!exercise || isDeleteExerciseLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )
          )}
        </SoftBox>
      }
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
      bottomNavigation={
        !isUpMd && (
          <>
            <Tooltip title={t("Exercise:updateExercise")}>
              <BottomNavigationAction icon={<EditIcon />} onClick={update} />
            </Tooltip>
            <Tooltip title={t("Exercise:deleteExercise")}>
              <BottomNavigationAction
                icon={<DeleteIcon />}
                onClick={onDeleteExerciseClick}
                disabled={!exercise || isDeleteExerciseLoading}
              />
            </Tooltip>
          </>
        )
      }
    >
      {() => (
        <>
          {isDeleteExerciseError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorDeletingExercise")}
            </Alert>
          )}
          {isRelatedExercisesError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorLoadingRelatedExercises")}
            </Alert>
          )}
          <ExerciseInfo
            exercise={exercise}
            handleOpenExerciseClick={handleOpenExerciseClick}
            isRelatedExercisesLoading={isRelatedExercisesLoading}
            relatedExercises={relatedExercises}
          />
          {exercise.description_blocks?.map((block, index) => (
            <ExerciseBlock
              block={block}
              blockNumber={index + 1}
              key={block._id}
            />
          ))}
        </>
      )}
    </ProfileLayout>
  );
};

export default Exercise;
