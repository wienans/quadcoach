import { useLocation, useParams } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import { useTranslation } from "react-i18next";
import {
  Alert,
  BottomNavigationAction,
  Card,
  IconButton,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
  Grid,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

import {
  useGetPracticePlanQuery,
  usePatchPracticePlanMutation,
  useGetAllPracticePlanAccessUsersQuery,
  useDeletePracticePlanMutation,
} from "../../api/quadcoachApi/practicePlansApi";
import {
  useAddFavoritePracticePlanMutation,
  useRemoveFavoritePracticePlanMutation,
  useLazyGetFavoritePracticePlansQuery,
} from "../../api/quadcoachApi/favoriteApi";
import { useAuth } from "../../store/hooks";
import { useEffect, useRef, useState } from "react";
import { SoftBox, SoftButton, SoftInput } from "../../components";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import TimerIcon from "@mui/icons-material/Timer";
import * as Yup from "yup";
import { useFormik } from "formik";

import {
  FieldArray,
  FieldArrayRenderProps,
  FormikProps,
  FormikProvider,
} from "formik";

// Define types for better type safety
interface PracticePlanItem {
  _id?: string;
  kind: "break" | "exercise";
  description?: string;
  duration: number;
  exerciseId?: string;
  blockId?: string;
}

interface PracticePlanGroup {
  _id?: string;
  name: string;
  items: PracticePlanItem[];
}

interface PracticePlanSection {
  _id?: string;
  name: string;
  targetDuration: number;
  groups: PracticePlanGroup[];
}

interface FormikValues {
  name: string;
  tags: string[];
  description: string;
  sections: PracticePlanSection[];
  user: string;
}

// Section Component
interface SectionComponentProps {
  section: PracticePlanSection;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<FormikValues>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const SectionComponent: React.FC<SectionComponentProps> = ({
  section,
  sectionIndex,
  isEditMode,
  formik,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}) => {
  const { t } = useTranslation("Exercise");

  // Calculate total duration for the section
  const calculateSectionTotal = () => {
    return (
      section.groups?.reduce((total: number, group: PracticePlanGroup) => {
        const groupTotal =
          group.items?.reduce((groupSum: number, item: PracticePlanItem) => {
            return groupSum + (item.duration || 0);
          }, 0) || 0;
        return total + groupTotal;
      }, 0) || 0
    );
  };

  const sectionTotal = calculateSectionTotal();
  const isOverTarget = sectionTotal > section.targetDuration;

  return (
    <SoftBox mb={4}>
      <Card>
        <SoftBox p={3}>
          {/* Section Header */}
          <SoftBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <SoftBox display="flex" alignItems="center" flex={1}>
              {isEditMode ? (
                <SoftInput
                  placeholder={t("sectionName", {
                    defaultValue: "Section Name",
                  })}
                  value={section.name}
                  onChange={(e) => {
                    const sections = [...formik.values.sections];
                    sections[sectionIndex].name = e.target.value;
                    formik.setFieldValue("sections", sections);
                  }}
                  sx={{ mr: 2, minWidth: 200 }}
                />
              ) : (
                <Typography variant="h5" fontWeight="bold" mr={2}>
                  {section.name}
                </Typography>
              )}

              <SoftBox display="flex" alignItems="center">
                <TimerIcon fontSize="small" sx={{ mr: 1 }} />
                {isEditMode ? (
                  <SoftInput
                    type="number"
                    value={section.targetDuration}
                    onChange={(e) => {
                      const sections = [...formik.values.sections];
                      sections[sectionIndex].targetDuration =
                        parseInt(e.target.value) || 0;
                      formik.setFieldValue("sections", sections);
                    }}
                    sx={{ width: 80 }}
                  />
                ) : (
                  <Typography variant="body2">
                    {section.targetDuration}min
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" ml={1}>
                  / {sectionTotal}min
                </Typography>
                {isOverTarget && (
                  <Chip
                    label="Over target"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </SoftBox>
            </SoftBox>

            {/* Section Actions */}
            {isEditMode && (
              <SoftBox display="flex" gap={1}>
                <Tooltip title="Move Up">
                  <IconButton
                    size="small"
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move Down">
                  <IconButton
                    size="small"
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Section">
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </SoftBox>
            )}
          </SoftBox>

          <Divider sx={{ mb: 2 }} />

          {/* Groups */}
          <FieldArray
            name={`sections.${sectionIndex}.groups`}
            render={(groupArrayHelpers: FieldArrayRenderProps) => (
              <SoftBox>
                {/* Determine grid columns based on screen size */}
                <Grid container spacing={2}>
                  {section.groups?.map(
                    (group: PracticePlanGroup, groupIndex: number) => (
                      <Grid
                        item
                        xs={12}
                        sm={section.groups.length > 1 ? 6 : 12}
                        md={
                          section.groups.length > 2
                            ? 4
                            : section.groups.length > 1
                            ? 6
                            : 12
                        }
                        key={group._id || groupIndex}
                      >
                        <GroupComponent
                          group={group}
                          groupIndex={groupIndex}
                          sectionIndex={sectionIndex}
                          isEditMode={isEditMode}
                          formik={formik}
                          onDelete={() => groupArrayHelpers.remove(groupIndex)}
                        />
                      </Grid>
                    ),
                  )}
                </Grid>

                {/* Add Group Button - only in edit mode */}
                {isEditMode && (
                  <SoftBox display="flex" justifyContent="center" mt={2}>
                    <SoftButton
                      variant="outlined"
                      size="small"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        groupArrayHelpers.push({
                          _id: `temp_${Date.now()}_${Math.random()}`,
                          name: "New Group",
                          items: [],
                        });
                      }}
                    >
                      {t("addGroup", { defaultValue: "Add Group" })}
                    </SoftButton>
                  </SoftBox>
                )}
              </SoftBox>
            )}
          />
        </SoftBox>
      </Card>
    </SoftBox>
  );
};

// Group Component
interface GroupComponentProps {
  group: PracticePlanGroup;
  groupIndex: number;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<FormikValues>;
  onDelete: () => void;
}

const GroupComponent: React.FC<GroupComponentProps> = ({
  group,
  groupIndex,
  sectionIndex,
  isEditMode,
  formik,
  onDelete,
}) => {
  const { t } = useTranslation("Exercise");

  // Calculate total duration for the group
  const calculateGroupTotal = () => {
    return (
      group.items?.reduce((total: number, item: PracticePlanItem) => {
        return total + (item.duration || 0);
      }, 0) || 0
    );
  };

  const groupTotal = calculateGroupTotal();

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <SoftBox p={2}>
        {/* Group Header */}
        <SoftBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {isEditMode ? (
            <SoftInput
              placeholder={t("groupName", { defaultValue: "Group Name" })}
              value={group.name}
              onChange={(e) => {
                const sections = [...formik.values.sections];
                sections[sectionIndex].groups[groupIndex].name = e.target.value;
                formik.setFieldValue("sections", sections);
              }}
              size="small"
            />
          ) : (
            <Typography variant="h6" fontWeight="medium">
              {group.name}
            </Typography>
          )}

          <SoftBox display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {groupTotal}min
            </Typography>
            {isEditMode && (
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </SoftBox>
        </SoftBox>

        <Divider sx={{ mb: 2 }} />

        {/* Items */}
        <FieldArray
          name={`sections.${sectionIndex}.groups.${groupIndex}.items`}
          render={(itemArrayHelpers: FieldArrayRenderProps) => (
            <SoftBox>
              {group.items?.map((item: PracticePlanItem, itemIndex: number) => (
                <ItemComponent
                  key={item._id || itemIndex}
                  item={item}
                  itemIndex={itemIndex}
                  groupIndex={groupIndex}
                  sectionIndex={sectionIndex}
                  isEditMode={isEditMode}
                  formik={formik}
                  onDelete={() => itemArrayHelpers.remove(itemIndex)}
                />
              ))}

              {/* Add Item Buttons - only in edit mode */}
              {isEditMode && (
                <SoftBox display="flex" gap={1} mt={2}>
                  <SoftButton
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      itemArrayHelpers.push({
                        _id: `temp_${Date.now()}_${Math.random()}`,
                        kind: "exercise",
                        exerciseId: "",
                        blockId: "",
                        duration: 10,
                      });
                    }}
                  >
                    {t("addExercise", { defaultValue: "Add Exercise" })}
                  </SoftButton>
                  <SoftButton
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      itemArrayHelpers.push({
                        _id: `temp_${Date.now()}_${Math.random()}`,
                        kind: "break",
                        description: "Break",
                        duration: 5,
                      });
                    }}
                  >
                    {t("addBreak", { defaultValue: "Add Break" })}
                  </SoftButton>
                </SoftBox>
              )}
            </SoftBox>
          )}
        />
      </SoftBox>
    </Card>
  );
};

// Item Component
interface ItemComponentProps {
  item: PracticePlanItem;
  itemIndex: number;
  groupIndex: number;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<FormikValues>;
  onDelete: () => void;
}

const ItemComponent: React.FC<ItemComponentProps> = ({
  item,
  itemIndex,
  groupIndex,
  sectionIndex,
  isEditMode,
  formik,
  onDelete,
}) => {
  const { t } = useTranslation("Exercise");

  const updateItem = (field: string, value: string | number) => {
    const sections = [...formik.values.sections];
    sections[sectionIndex].groups[groupIndex].items[itemIndex][field] = value;
    formik.setFieldValue("sections", sections);
  };

  return (
    <SoftBox
      mb={2}
      p={2}
      borderRadius="lg"
      bgColor={item.kind === "break" ? "light" : "white"}
      border="1px solid"
      borderColor={item.kind === "break" ? "secondary" : "primary"}
    >
      <SoftBox display="flex" alignItems="center" gap={1} mb={1}>
        {item.kind === "exercise" ? (
          <FitnessCenterIcon color="primary" fontSize="small" />
        ) : (
          <FreeBreakfastIcon color="secondary" fontSize="small" />
        )}

        <Typography variant="body2" fontWeight="medium" flex={1}>
          {item.kind === "exercise" ? "Exercise" : "Break"}
        </Typography>

        <SoftBox display="flex" alignItems="center" gap={1}>
          <TimerIcon fontSize="small" />
          {isEditMode ? (
            <SoftInput
              type="number"
              value={item.duration}
              onChange={(e) =>
                updateItem("duration", parseInt(e.target.value) || 0)
              }
              sx={{ width: 60 }}
              size="small"
            />
          ) : (
            <Typography variant="body2">{item.duration}min</Typography>
          )}

          {isEditMode && (
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </SoftBox>
      </SoftBox>

      {item.kind === "break" && (
        <SoftBox>
          {isEditMode ? (
            <SoftInput
              placeholder={t("breakDescription", {
                defaultValue: "Break description",
              })}
              value={item.description}
              onChange={(e) => updateItem("description", e.target.value)}
              size="small"
              fullWidth
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          )}
        </SoftBox>
      )}

      {item.kind === "exercise" && (
        <SoftBox>
          {isEditMode ? (
            <SoftBox display="flex" gap={1}>
              <SoftInput
                placeholder="Exercise ID"
                value={item.exerciseId}
                onChange={(e) => updateItem("exerciseId", e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <SoftInput
                placeholder="Block ID"
                value={item.blockId}
                onChange={(e) => updateItem("blockId", e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </SoftBox>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Exercise ID: {item.exerciseId}
            </Typography>
          )}
        </SoftBox>
      )}
    </SoftBox>
  );
};

const PracticePlanner = (): JSX.Element => {
  const { t } = useTranslation("ExerciseList");
  const location = useLocation();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { id: userId, roles: userRoles } = useAuth();
  const autoEditAppliedRef = useRef(false);
  // Track whether to show validation summary (only after failed save attempt)
  const [showValidationSummary, setShowValidationSummary] =
    useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const { planId } = useParams<{ planId: string }>();

  const {
    data: plan,
    isLoading: isPlanLoading,
    isError: isPlanError,
  } = useGetPracticePlanQuery(planId || "", {
    skip: !planId,
  });
  const [updatePlan, { isLoading: isUpdatePlanLoading }] =
    usePatchPracticePlanMutation();
  const [deletePlan, { isLoading: isDeletePlanLoading }] =
    useDeletePracticePlanMutation();
  const onDeletePlanClick = () => {
    if (!plan) return;
    deletePlan(plan._id);
  };

  const [getFavoritePlans, { data: favoritePlans }] =
    useLazyGetFavoritePracticePlansQuery();

  const [addFavoritePlan, { isLoading: isAddFavoritePlanLoading }] =
    useAddFavoritePracticePlanMutation();
  const [removeFavoritePlan, { isLoading: isRemoveFavoritePlanLoading }] =
    useRemoveFavoritePracticePlanMutation();

  const { data: accessUsers } = useGetAllPracticePlanAccessUsersQuery(
    planId || "",
    { skip: !planId },
  );

  const isCreator =
    plan?.user?.toString() === userId ||
    userRoles.includes("Admin") ||
    userRoles.includes("admin");

  useEffect(() => {
    if (userId) {
      getFavoritePlans({ userId });
    }
  }, [userId, getFavoritePlans]);

  useEffect(() => {
    if (favoritePlans && planId) {
      setIsFavorite(
        favoritePlans.some(
          (favoritePlan) => favoritePlan.practicePlan === planId,
        ),
      );
    }
  }, [favoritePlans, setIsFavorite, planId]);
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

  // When plan data first loads (or changes) and not in edit mode, sync form values manually
  useEffect(() => {
    if (plan && !isEditMode) {
      formik.setValues({
        name: plan?.name ?? "",
        tags: plan?.tags ?? [],
        description: plan?.description ?? "",
        sections: plan?.sections ?? [],
        user: plan?.user ?? "",
      });
      formik.setTouched({});
    }
  }, [plan, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup formik form for editing
  const formik = useFormik<FormikValues>({
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      name: plan?.name ?? "",
      tags: plan?.tags ?? [],
      description: plan?.description ?? "",
      sections: plan?.sections ?? [],
      user: plan?.user ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Exercise:validation.name.required"),
      tags: Yup.array().of(Yup.string()),
      description: Yup.string(),
      sections: Yup.array().of(
        Yup.object({
          name: Yup.string().required(
            "Exercise:validation.section.name.required",
          ),
          targetDuration: Yup.number()
            .min(0, "Exercise:validation.section.targetDuration.min")
            .required("Exercise:validation.section.targetDuration.required"),
          groups: Yup.array().of(
            Yup.object({
              name: Yup.string().required(
                "Exercise:validation.group.name.required",
              ),
              items: Yup.array().of(
                Yup.object({
                  kind: Yup.string().oneOf(["break", "exercise"]).required(),

                  description: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "break"
                      ? schema.required(
                          "Exercise:validation.item.description.required",
                        )
                      : schema.notRequired(),
                  ),

                  duration: Yup.number()
                    .min(1, "Exercise:validation.item.duration.min")
                    .required("Exercise:validation.item.duration.required"),

                  exerciseId: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "exercise"
                      ? schema.required(
                          "Exercise:validation.item.exerciseId.required",
                        )
                      : schema.notRequired(),
                  ),

                  blockId: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "exercise"
                      ? schema.required(
                          "Exercise:validation.item.blockId.required",
                        )
                      : schema.notRequired(),
                  ),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    onSubmit: async (values) => {
      console.log("submitting", values);
      if (planId) {
        // const sanitizedBlocks: Block[] = values.description_blocks.map(
        //   (block) => {
        //     if (
        //       typeof block._id === "string" &&
        //       block._id.startsWith("temp_")
        //     ) {
        //       const { _id: _omitId, ...rest } = block;
        //       void _omitId; // mark as used to satisfy lint
        //       return rest as Block; // backend will generate a new _id
        //     }
        //     return block;
        //   },
        // );
        const planUpdate = {
          _id: planId,
          ...values,
          // description_blocks: sanitizedBlocks,
        };
        console.log("update: ", planUpdate);
        console.log(plan);
        try {
          await updatePlan(planUpdate).unwrap();
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
      console.log("validating before save...");
      const errors = await formik.validateForm();
      console.log("validation errors: ", errors);
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

  if (isPlanLoading) {
    return (
      <DashboardLayout>
        {() => (
          <>
            <Card>
              <Skeleton variant="rectangular" width={"100%"} height={120} />
            </Card>
            <SoftBox mt={5} mb={3}>
              <Skeleton variant="rectangular" width={"100%"} height={"100%"} />
            </SoftBox>
          </>
        )}
      </DashboardLayout>
    );
  }

  if (!plan || isPlanError || !planId) {
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
          plan?.name
        )
      }
      //   headerBackgroundImage={headerBackgroundImage}
      isDataLoading={isPlanLoading}
      headerAction={
        <SoftBox display="flex">
          {userId && userId !== "" && planId && (
            <Tooltip title={t("Exercise:favoriteExercise")}>
              <IconButton
                disabled={
                  isAddFavoritePlanLoading || isRemoveFavoritePlanLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoritePlan({
                      practicePlanId: planId,
                      userId: userId,
                    });
                  } else {
                    addFavoritePlan({
                      practicePlanId: planId,
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
                disabled={isPlanLoading || isUpdatePlanLoading}
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
                onClick={onDeletePlanClick}
                color="error"
                disabled={!plan || isDeletePlanLoading}
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
          userId && userId !== "" && planId && (
            <Tooltip key="favorite" title={t("Exercise:favoriteExercise")}>
              <BottomNavigationAction
                icon={<FavoriteIcon color={isFavorite ? "error" : "inherit"} />}
                disabled={
                  isAddFavoritePlanLoading || isRemoveFavoritePlanLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoritePlan({
                      practicePlanId: planId,
                      userId: userId,
                    });
                  } else {
                    addFavoritePlan({
                      practicePlanId: planId,
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
                disabled={isPlanLoading || isUpdatePlanLoading}
              />
            </Tooltip>
          ),
          isPrivileged && (
            <Tooltip key="delete" title={t("Exercise:deleteExercise")}>
              <BottomNavigationAction
                icon={<DeleteIcon />}
                onClick={onDeletePlanClick}
                disabled={!plan || isDeletePlanLoading}
              />
            </Tooltip>
          ),
        ]
      }
    >
      {() => (
        <FormikProvider value={formik}>
          <>
            {isUpdatePlanLoading && (
              <Alert color="info" sx={{ mt: 2, mb: 2 }}>
                {t("Exercise:saving", { defaultValue: "Saving..." })}
              </Alert>
            )}

            {isEditMode &&
              showValidationSummary &&
              Object.keys(formik.errors).length > 0 && (
                <Alert color="warning" sx={{ mt: 2, mb: 2 }}>
                  {t("Exercise:validation.fixValidationErrors", {
                    defaultValue:
                      "Please fix the highlighted validation errors:",
                  })}
                  <ul style={{ marginTop: 8 }}>
                    {Object.entries(formik.errors).map(([field, error]) => {
                      if (typeof error === "string") {
                        return (
                          <li key={field} style={{ fontSize: 12 }}>
                            <strong>{field}:</strong> {t(error, error)}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </Alert>
              )}

            {/* Description Field */}
            <SoftBox mb={3}>
              {isEditMode ? (
                <SoftInput
                  multiline
                  rows={3}
                  placeholder={t("Exercise:description", {
                    defaultValue: "Description",
                  })}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="description"
                />
              ) : (
                plan?.description && (
                  <Typography variant="body1" color="text.secondary">
                    {plan.description}
                    {formik.values.sections.length}
                  </Typography>
                )
              )}
            </SoftBox>

            {/* Sections */}
            <FieldArray
              name="sections"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <SoftBox>
                  {formik.values.sections?.map((section, sectionIndex) => (
                    <SectionComponent
                      key={section._id || sectionIndex}
                      section={section}
                      sectionIndex={sectionIndex}
                      isEditMode={isEditMode}
                      formik={formik}
                      onMoveUp={() => {
                        if (sectionIndex > 0) {
                          const sections = [...formik.values.sections];
                          [sections[sectionIndex], sections[sectionIndex - 1]] =
                            [
                              sections[sectionIndex - 1],
                              sections[sectionIndex],
                            ];
                          formik.setFieldValue("sections", sections);
                        }
                      }}
                      onMoveDown={() => {
                        if (
                          sectionIndex <
                          (formik.values.sections?.length || 0) - 1
                        ) {
                          const sections = [...formik.values.sections];
                          [sections[sectionIndex], sections[sectionIndex + 1]] =
                            [
                              sections[sectionIndex + 1],
                              sections[sectionIndex],
                            ];
                          formik.setFieldValue("sections", sections);
                        }
                      }}
                      onDelete={() => arrayHelpers.remove(sectionIndex)}
                      canMoveUp={sectionIndex > 0}
                      canMoveDown={
                        sectionIndex < (formik.values.sections?.length || 0) - 1
                      }
                    />
                  ))}

                  {/* Add Section Button - only in edit mode */}
                  {isEditMode && (
                    <SoftBox
                      display="flex"
                      justifyContent="center"
                      mt={3}
                      mb={3}
                    >
                      <SoftButton
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          arrayHelpers.push({
                            _id: `temp_${Date.now()}_${Math.random()}`,
                            name: "New Section",
                            targetDuration: 30,
                            groups: [],
                          });
                        }}
                      >
                        {t("Exercise:addSection", {
                          defaultValue: "Add Section",
                        })}
                      </SoftButton>
                    </SoftBox>
                  )}
                </SoftBox>
              )}
            />
          </>
        </FormikProvider>
      )}
    </ProfileLayout>
  );
};

export default PracticePlanner;
