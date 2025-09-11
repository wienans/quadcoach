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
  ToggleButton,
} from "@mui/material";
import { SoftBox } from "../../../../components";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
} from "../../../exerciseApi";
import { useTranslation } from "react-i18next";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../../../components/LayoutContainers";
import { getExerciseTypeHeaderBackgroundImage } from "../../../../components/LayoutContainers/ProfileLayout";
import {
  ExerciseType,
  getExerciseType,
} from "../../../../helpers/exerciseHelpers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExerciseBlock from "./ExerciseBlock";
import ExerciseInfo from "./ExerciseInfo";
import { useAuth } from "../../../../store/hooks";
import Footer from "../../../../components/Footer";
import {
  useAddFavoriteExerciseMutation,
  useLazyGetFavoriteExercisesQuery,
  useRemoveFavoriteExerciseMutation,
} from "../../../../api/quadcoachApi/favoriteApi";
import { useAppSelector, useAppDispatch } from "../../../../store/hooks";
import { setIsEditMode } from "../exerciseSlice";

const Exercise = () => {
  const { t } = useTranslation("Exercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const { id: userId, roles: userRoles } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  const dispatch = useAppDispatch();
  const isEditMode = useAppSelector((state) => state.exercise.isEditMode);

  const theme = useTheme();

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

  const [getFavoriteExercises, { data: favoriteExercises }] =
    useLazyGetFavoriteExercisesQuery();

  const [addFavoriteExercise, { isLoading: isAddFavoriteExerciseLoading }] =
    useAddFavoriteExerciseMutation();
  const [
    removeFavoriteExercise,
    { isLoading: isRemoveFavoriteExerciseLoading },
  ] = useRemoveFavoriteExerciseMutation();

  useEffect(() => {
    if (userId) {
      getFavoriteExercises({ userId });
    }
  }, [userId, getFavoriteExercises]);

  const [exerciseType, setExerciseType] = useState<ExerciseType | undefined>();
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<
    string | undefined
  >();

  useEffect(() => {
    setExerciseType(exercise ? getExerciseType(exercise) : undefined);
  }, [exercise]);

  useEffect(() => {
    if (favoriteExercises) {
      setIsFavorite(
        favoriteExercises.some(
          (favoriteExercise) => favoriteExercise.exercise === exerciseId,
        ),
      );
    }
  }, [favoriteExercises, setIsFavorite, exerciseId]);

  useEffect(() => {
    setHeaderBackgroundImage(
      exerciseType && exercise
        ? getExerciseTypeHeaderBackgroundImage(exerciseType, theme)
        : undefined,
    );
  }, [exercise, exerciseType, theme]);

  useEffect(() => {
    if (
      userId == exercise?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    }
  }, [exercise, userId, userRoles]);

  // Edit mode toggle functionality
  const onToggleEditMode = () => {
    dispatch(setIsEditMode(!isEditMode));
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
      <DashboardLayout>
        {() => (
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
        )}
      </DashboardLayout>
    );
  }

  if (!exercise || isExerciseError) {
    return (
      <DashboardLayout>
        {() => (
          <>
            <Alert color="error">{t("Exercise:errorLoadingExercise")}</Alert>;
          </>
        )}
      </DashboardLayout>
    );
  }

  return (
    <ProfileLayout
      title={exercise?.name}
      headerBackgroundImage={headerBackgroundImage}
      isDataLoading={isExerciseLoading}
      headerAction={
        <SoftBox display="flex">
          {userId && userId !== "" && exerciseId && (
            <Tooltip title={t("Exercise:favoriteExercise")}>
              <IconButton
                disabled={
                  isAddFavoriteExerciseLoading ||
                  isRemoveFavoriteExerciseLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoriteExercise({
                      exerciseId: exerciseId,
                      userId: userId,
                    });
                  } else {
                    addFavoriteExercise({
                      exerciseId: exerciseId,
                      userId: userId,
                    });
                  }
                }}
              >
                <FavoriteIcon color={isFavorite ? "error" : "inherit"} />
              </IconButton>
            </Tooltip>
          )}
          {isPrivileged && (
            <Tooltip
              title={t("Exercise:updateExercise", {
                context: isEditMode ? "editMode" : "viewMode",
              })}
            >
              <span>
                <ToggleButton
                  disabled={isExerciseLoading}
                  value={isEditMode}
                  size="small"
                  selected={isEditMode}
                  onChange={onToggleEditMode}
                  sx={{
                    mr: 1,
                  }}
                >
                  {isEditMode ? (
                    <SaveIcon color="primary" />
                  ) : (
                    <EditIcon color="primary" />
                  )}
                </ToggleButton>
              </span>
            </Tooltip>
          )}
          {isPrivileged && (
            <Tooltip title={t("Exercise:deleteExercise")}>
              <IconButton
                onClick={onDeleteExerciseClick}
                color="error"
                disabled={!exercise || isDeleteExerciseLoading}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </SoftBox>
      }
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
      bottomNavigation={
        !isUpMd && [
          userId && userId !== "" && exerciseId && (
            <Tooltip key="favorite" title={t("Exercise:favoriteExercise")}>
              <BottomNavigationAction
                icon={<FavoriteIcon color={isFavorite ? "error" : "inherit"} />}
                disabled={
                  isAddFavoriteExerciseLoading ||
                  isRemoveFavoriteExerciseLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoriteExercise({
                      exerciseId: exerciseId,
                      userId: userId,
                    });
                  } else {
                    addFavoriteExercise({
                      exerciseId: exerciseId,
                      userId: userId,
                    });
                  }
                }}
              />
            </Tooltip>
          ),
          isPrivileged && (
            <Tooltip
              key="edit"
              title={t("Exercise:updateExercise", {
                context: isEditMode ? "editMode" : "viewMode",
              })}
            >
              <BottomNavigationAction
                icon={isEditMode ? <SaveIcon /> : <EditIcon />}
                onClick={onToggleEditMode}
                disabled={isExerciseLoading}
              />
            </Tooltip>
          ),
          isPrivileged && (
            <Tooltip key="delete" title={t("Exercise:deleteExercise")}>
              <BottomNavigationAction
                icon={<DeleteIcon />}
                onClick={onDeleteExerciseClick}
                disabled={!exercise || isDeleteExerciseLoading}
              />
            </Tooltip>
          ),
        ]
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
          <Footer />
        </>
      )}
    </ProfileLayout>
  );
};

export default Exercise;
