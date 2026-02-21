import "./translations";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Card,
  Skeleton,
  useMediaQuery,
  IconButton,
  Tooltip,
  Theme,
  BottomNavigationAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
  useUpdateExerciseMutation,
  useGetAllExerciseAccessUsersQuery,
  useShareExerciseMutation,
  useDeleteExerciseAccessMutation,
} from "../../../exerciseApi";
import { useTranslation } from "react-i18next";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../../../components/LayoutContainers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

import { ExercisePartialId, Block } from "../../../../api/quadcoachApi/domain";
import {
  FormikProvider,
  useFormik,
  FieldArray,
  FieldArrayRenderProps,
} from "formik";
import * as Yup from "yup";
import { SoftButton, SoftBox, SoftInput } from "../../../../components";

const Exercise = () => {
  const location = useLocation();
  const { t } = useTranslation("Exercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const { id: userId, roles: userRoles } = useAuth();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const autoEditAppliedRef = useRef(false);
  // Track whether to show validation summary (only after failed save attempt)
  const [showValidationSummary, setShowValidationSummary] =
    useState<boolean>(false);

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

  const { data: accessUsers } = useGetAllExerciseAccessUsersQuery(
    exerciseId || "",
    { skip: !exerciseId },
  );

  const isCreator =
    exercise?.user?.toString() === userId ||
    userRoles.includes("Admin") ||
    userRoles.includes("admin");

  const [shareExercise, { isLoading: isShareExerciseLoading }] =
    useShareExerciseMutation();

  const [deleteExerciseAccess, { isLoading: isDeleteExerciseAccessLoading }] =
    useDeleteExerciseAccessMutation();

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
    if (!userId) {
      setIsPrivileged(false);
      return;
    }
    if (isCreator) {
      setIsPrivileged(true);
      return;
    }
    if (
      accessUsers &&
      accessUsers.some(
        (entry) => entry.user._id === userId && entry.access === "edit",
      )
    ) {
      setIsPrivileged(true);
    } else {
      setIsPrivileged(false);
    }
  }, [userId, isCreator, accessUsers]);

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
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,
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
      persons: Yup.number()
        .transform((val, orig) => (orig === "" ? NaN : val))
        .required("Exercise:validation.persons.required")
        .min(0, "Exercise:validation.persons.min")
        .test(
          "persons-gte-roles",
          "Exercise:validation.persons.lessThanRoles",
          function (value) {
            const { beaters, chasers } = this.parent as {
              beaters?: number;
              chasers?: number;
            };
            if (value == null) return false;
            const rolesTotal = (beaters ?? 0) + (chasers ?? 0);
            return value >= rolesTotal;
          },
        ),
      time_min: Yup.number()
        .transform((val, orig) => (orig === "" ? NaN : val))
        .required("Exercise:validation.time_min.required")
        .min(0, "Exercise:validation.time_min.min"),
      beaters: Yup.number()
        .transform((val, orig) => (orig === "" ? NaN : val))
        .required("Exercise:validation.beaters.required")
        .min(0, "Exercise:validation.beaters.min"),
      chasers: Yup.number()
        .transform((val, orig) => (orig === "" ? NaN : val))
        .required("Exercise:validation.chasers.required")
        .min(0, "Exercise:validation.chasers.min"),
      materials: Yup.array().of(Yup.string()),
      tags: Yup.array().of(Yup.string()),
      description_blocks: Yup.array().of(
        Yup.object({
          description: Yup.string().required(
            "Exercise:validation.block.description.missing",
          ),
          video_url: Yup.string().url(
            "Exercise:validation.block.video_url.notValid",
          ),
          coaching_points: Yup.string(),
          time_min: Yup.number()
            .transform((val, orig) => (orig === "" ? NaN : val))
            .min(0, "Exercise:validation.block.time_min.min"),
          tactics_board: Yup.string(),
        }),
      ),
      related_to: Yup.array().of(Yup.string()),
    }),
    onSubmit: async (values) => {
      const calculate_time = values.description_blocks.reduce(
        (partialSum, current) => partialSum + (current.time_min || 0),
        0,
      );
      values.time_min = calculate_time;
      if (exerciseId) {
        const sanitizedBlocks: Block[] = values.description_blocks.map(
          (block) => {
            if (
              typeof block._id === "string" &&
              block._id.startsWith("temp_")
            ) {
              const { _id: _omitId, ...rest } = block;
              void _omitId; // mark as used to satisfy lint
              return rest as Block; // backend will generate a new _id
            }
            return block;
          },
        );
        const exerciseUpdate = {
          _id: exerciseId,
          ...values,
          description_blocks: sanitizedBlocks,
        };
        try {
          await updateExercise(exerciseUpdate).unwrap();
        } catch (e) {
          // Error alert handled by isUpdateExerciseError condition
        }
      }
    },
  });

  // Auto-enter edit mode if URL has ?edit=1 and user is privileged (runs after formik init)
  useEffect(() => {
    if (autoEditAppliedRef.current) return;
    if (!isEditMode && isPrivileged) {
      const params = new URLSearchParams(location.search);
      if (params.get("edit") === "1") {
        autoEditAppliedRef.current = true;
        setShowValidationSummary(true);
        formik.setErrors({});
        formik.setTouched({});
        setIsEditMode(true);
        params.delete("edit");
        const newQuery = params.toString();
        const newUrl = `${location.pathname}${newQuery ? `?${newQuery}` : ""}`;
        window.history.replaceState({}, "", newUrl);
      } else {
        autoEditAppliedRef.current = true; // no edit flag; avoid re-checking
      }
    }
  }, [location.search, isPrivileged, isEditMode, formik, location.pathname]);

  // Edit mode toggle functionality
  const onToggleEditMode = async () => {
    if (!isPrivileged) return;
    if (isEditMode) {
      const errors = await formik.validateForm();
      if (Object.keys(errors).length === 0) {
        setShowValidationSummary(false);
        formik.submitForm();
      } else {
        setShowValidationSummary(true);
        Object.keys(errors).forEach((field) =>
          formik.setFieldTouched(field, true, false),
        );
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } else {
      setShowValidationSummary(false);
      formik.setErrors({});
      formik.setTouched({});
      setIsEditMode(true);
    }
  };

  useEffect(() => {
    if (isUpdateExerciseSuccess) {
      setIsEditMode(false);
    }
  }, [isUpdateExerciseSuccess]);

  useEffect(() => {
    if (isEditMode && isUpdateExerciseError) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [isEditMode, isUpdateExerciseError]);

  // When exercise data first loads (or changes) and not in edit mode, sync form values manually
  useEffect(() => {
    if (exercise && !isEditMode) {
      formik.setValues({
        name: exercise.name ?? "",
        persons: exercise.persons ?? 0,
        time_min: exercise.time_min ?? 0,
        beaters: exercise.beaters ?? 0,
        chasers: exercise.chasers ?? 0,
        materials: exercise.materials ?? [],
        tags: exercise.tags ?? [],
        description_blocks: exercise.description_blocks ?? [],
        related_to: exercise.related_to ?? [],
        creator: exercise.creator ?? "",
        user: exercise.user ?? "",
      });
      formik.setTouched({});
    }
  }, [exercise, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleAddAccess = async () => {
    if (!exerciseId) return;
    const trimmed = userEmail.trim();
    if (!trimmed) {
      setEmailError(t("Exercise:access.error.emailRequired"));
      return;
    }
    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError(t("Exercise:access.error.emailRequired"));
      return;
    }
    setEmailError("");
    try {
      await shareExercise({
        exerciseId,
        email: trimmed,
        access: "edit",
      }).unwrap();
      setUserEmail("");
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 404) {
        setEmailError(t("Exercise:access.error.notFound"));
      } else {
        setEmailError(t("Exercise:access.error.addFailed"));
      }
    }
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
          {isEditMode &&
            showValidationSummary &&
            Object.keys(formik.errors).length > 0 && (
              <Alert color="warning" sx={{ mt: 2, mb: 2 }}>
                {t("Exercise:validation.fixValidationErrors", {
                  defaultValue: "Please fix the highlighted validation errors:",
                })}
                <ul style={{ marginTop: 8 }}>
                  {Object.entries(formik.errors).map(([field, error]) => {
                    const fieldLabelMap: Record<string, string> = {
                      name: t("Exercise:exerciseName"),
                      persons: t("Exercise:info.personNumber"),
                      time_min: t("Exercise:info.time"),
                      beaters: t("Exercise:info.beaterNumber"),
                      chasers: t("Exercise:info.chaserNumber"),
                      tags: t("Exercise:tags.title"),
                      materials: t("Exercise:materials.title"),
                      related_to: t("Exercise:realtedToExercises.title"),
                    };
                    const label = fieldLabelMap[field] ?? field;
                    if (typeof error === "string") {
                      const translationOptions =
                        error === "Exercise:validation.persons.lessThanRoles"
                          ? {
                              requiredTotal:
                                (formik.values.beaters ?? 0) +
                                (formik.values.chasers ?? 0),
                            }
                          : undefined;
                      return (
                        <li key={field} style={{ fontSize: 12 }}>
                          <strong>{label}:</strong>{" "}
                          {t(error, translationOptions)}
                        </li>
                      );
                    }
                    if (
                      field === "description_blocks" &&
                      Array.isArray(error)
                    ) {
                      return error.map((blockErr, idx) => {
                        if (!blockErr || typeof blockErr !== "object")
                          return null;
                        const {
                          description: descriptionErr,
                          video_url: videoUrlErr,
                          time_min: timeErr,
                        } = blockErr as {
                          description?: string;
                          video_url?: string;
                          time_min?: string;
                        };
                        const issues: string[] = [];
                        if (typeof descriptionErr === "string")
                          issues.push(t(descriptionErr));
                        if (typeof videoUrlErr === "string")
                          issues.push(t(videoUrlErr));
                        if (typeof timeErr === "string")
                          issues.push(t(timeErr));
                        if (issues.length === 0) return null;
                        return (
                          <li key={`${field}_${idx}`} style={{ fontSize: 12 }}>
                            <strong>
                              {t("Exercise:block.title", {
                                blockNumber: idx + 1,
                              })}
                              :
                            </strong>{" "}
                            {issues.join("; ")}
                          </li>
                        );
                      });
                    }
                    if (error && typeof error === "object") {
                      return (
                        <li key={field} style={{ fontSize: 12 }}>
                          <strong>{label}:</strong>{" "}
                          {t("Exercise:validation.genericError", {
                            defaultValue: "Invalid value",
                          })}
                        </li>
                      );
                    }
                    return null;
                  })}
                </ul>
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

          {isEditMode && isCreator && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {t("Exercise:access.title")}
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      label={t("Exercise:access.add_user", {
                        defaultValue: "Add user",
                      })}
                      placeholder="Enter user email"
                      fullWidth
                      value={userEmail}
                      onChange={(e) => {
                        setUserEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      error={!!emailError}
                      helperText={emailError}
                      sx={{
                        "& .MuiInputBase-root": { height: "40px" },
                        "& .MuiInputBase-input": { padding: "8.5px 14px" },
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      disabled={isShareExerciseLoading || !userEmail.trim()}
                      onClick={handleAddAccess}
                    >
                      {t("Exercise:access.add", { defaultValue: "Add" })}
                    </Button>
                  </Box>
                  <List>
                    {accessUsers?.map((entry) => (
                      <ListItem
                        key={entry.user._id}
                        secondaryAction={
                          <Button
                            size="small"
                            color="error"
                            disabled={isDeleteExerciseAccessLoading}
                            onClick={() => {
                              if (exerciseId) {
                                deleteExerciseAccess({
                                  exerciseId: exerciseId,
                                  userId: entry.user._id,
                                });
                              }
                            }}
                          >
                            {t("common:remove", { defaultValue: "Remove" })}
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={entry.user.name + " (" + entry.access + ")"}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          <Footer />
        </FormikProvider>
      )}
    </ProfileLayout>
  );
};

export default Exercise;
