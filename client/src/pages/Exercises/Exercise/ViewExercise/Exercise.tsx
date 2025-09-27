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
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
  useUpdateExerciseMutation,
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
import AddIcon from "@mui/icons-material/Add";
import ExerciseBlock from "./ExerciseBlock";
import ExerciseInfo from "./ExerciseInfo";
import { useAuth } from "../../../../store/hooks";
import Footer from "../../../../components/Footer";
import {
  useAddFavoriteExerciseMutation,
  useLazyGetFavoriteExercisesQuery,
  useRemoveFavoriteExerciseMutation,
} from "../../../../api/quadcoachApi/favoriteApi";

import {
  ExerciseWithOutId,
  ExercisePartialId,
  Block,
} from "../../../../api/quadcoachApi/domain";
import {
  FormikProvider,
  useFormik,
  FieldArray,
  FieldArrayRenderProps,
} from "formik";
import * as Yup from "yup";
import { SoftButton, SoftBox, SoftInput } from "../../../../components";
import { time } from "console";

const Exercise = () => {
  const { t } = useTranslation("Exercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const { id: userId, roles: userRoles } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const theme = useTheme();

  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  // Helper function to create a new empty block
  const createEmptyBlock = (): Block => ({
    _id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID for new blocks
    description: "",
    video_url: "",
    coaching_points: "",
    time_min: 0,
    tactics_board: undefined,
  });

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

  // Add update exercise mutation
  const [
    updateExercise,
    {
      isError: isUpdateExerciseError,
      isLoading: isUpdateExerciseLoading,
      isSuccess: isUpdateExerciseSuccess,
    },
  ] = useUpdateExerciseMutation();

  // Setup formik form for editing
  const formik = useFormik<ExercisePartialId>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: {
      name: exercise?.name ?? "",
      persons: exercise?.persons ?? 0,
      time_min: exercise?.time_min ?? 0,
      beaters: exercise?.beaters ?? 0,
      chasers: exercise?.chasers ?? 0,
      materials: exercise?.materials ?? [],
      tags: exercise?.tags ?? [],
      description_blocks: exercise?.description_blocks ?? [],
      related_to: exercise?.related_to ?? [],
      creator: exercise?.creator ?? "",
      user: exercise?.user ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Exercise:validation.name.required"),
      persons: Yup.number().min(0, "Exercise:validation.persons.min"),
      time_min: Yup.number().min(0, "Exercise:validation.time_min.min"),
      beaters: Yup.number().min(0, "Exercise:validation.beaters.min"),
      chasers: Yup.number().min(0, "Exercise:validation.chasers.min"),
      materials: Yup.array().of(Yup.string()),
      tags: Yup.array().of(Yup.string()),
      description_blocks: Yup.array().of(
        Yup.object({
          description: Yup.string().required(
            "ExerciseEditForm:block.description.missing",
          ),
          video_url: Yup.string().url(
            "ExerciseEditForm:block.videoUrl.notValid",
          ),
          coaching_points: Yup.string(),
          time_min: Yup.number(),
          tactics_board: Yup.string(),
        }),
      ),
      related_to: Yup.array().of(Yup.object()),
    }),
    onSubmit: (values) => {
      const calculate_time = values.description_blocks.reduce(
        (partialSum, current) => partialSum + current.time_min,
        0,
      );
      values.time_min = calculate_time;
      if (exerciseId) {
        const exerciseUpdate = {
          _id: exerciseId,
          ...values,
        };
        updateExercise(exerciseUpdate);
      }
    },
  });

  // Edit mode toggle functionality
  const onToggleEditMode = () => {
    if (isPrivileged && isEditMode && formik.isValid) {
      // When exiting edit mode, save the form
      formik.submitForm();
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  useEffect(() => {
    if (isUpdateExerciseSuccess) {
      setIsEditMode(false);
    }
  }, [isUpdateExerciseSuccess]);

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
      title={
        isEditMode ? (
          <SoftInput
            error={formik.touched.name && Boolean(formik.errors.name)}
            name="name"
            required
            id="outlined-basic"
            placeholder={t("Exercise:exerciseName")}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        ) : (
          exercise?.name
        )
      }
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
              <IconButton
                disabled={isExerciseLoading || isUpdateExerciseLoading}
                onClick={onToggleEditMode}
              >
                {isEditMode ? (
                  <SaveIcon color="primary" />
                ) : (
                  <EditIcon color="primary" />
                )}
              </IconButton>
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
                disabled={isExerciseLoading || isUpdateExerciseLoading}
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
        <FormikProvider value={formik}>
          {isDeleteExerciseError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorDeletingExercise")}
            </Alert>
          )}
          {isUpdateExerciseError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorUpdatingExercise")}
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
            isEditMode={isEditMode}
            formik={formik}
          />
          {formik.values.description_blocks?.map((block, index) => (
            <ExerciseBlock
              block={block}
              blockNumber={index + 1}
              key={block._id}
              isEditMode={isEditMode}
              formik={formik}
              blockIndex={index}
            />
          ))}

          {/* Add Block Button - only in edit mode */}
          {isEditMode && (
            <FieldArray
              name="description_blocks"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <SoftBox display="flex" justifyContent="center" mt={3} mb={3}>
                  <SoftButton
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      arrayHelpers.push(createEmptyBlock());
                    }}
                  >
                    {t("Exercise:addBlock")}
                  </SoftButton>
                </SoftBox>
              )}
            />
          )}

          <Footer />
        </FormikProvider>
      )}
    </ProfileLayout>
  );
};

export default Exercise;
