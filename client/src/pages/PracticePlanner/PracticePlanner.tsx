import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import { useTranslation } from "react-i18next";
import "./translations";
import {
  Alert,
  BottomNavigationAction,
  Card,
  IconButton,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
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
import * as Yup from "yup";
import { useFormik } from "formik";

import { FieldArray, FieldArrayRenderProps, FormikProvider } from "formik";
import { PracticePlanEntityPartialId } from "../../api/quadcoachApi/domain/PracticePlan";
import PracticeSection from "./PracticeSection";
import { lazy, Suspense } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

const PracticePlanner = (): JSX.Element => {
  const { t } = useTranslation("PracticePlanner");
  const navigate = useNavigate();
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
  const [
    updatePlan,
    { isLoading: isUpdatePlanLoading, isSuccess: isUpdatePlanSuccess },
  ] = usePatchPracticePlanMutation();
  const [deletePlan, { isLoading: isDeletePlanLoading }] =
    useDeletePracticePlanMutation();
  const onDeletePlanClick = () => {
    if (!plan) return;
    deletePlan(plan._id);
    navigate("/practice-plans");
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
        isPrivate: plan?.isPrivate ?? false,
      });
      formik.setTouched({});
    }
  }, [plan, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup formik form for editing
  const formik = useFormik<PracticePlanEntityPartialId>({
    enableReinitialize: false,
    validateOnChange: false,
    validateOnBlur: true,
    initialValues: {
      name: plan?.name ?? "",
      tags: plan?.tags ?? [],
      description: plan?.description ?? "",
      sections: plan?.sections ?? [],
      user: plan?.user ?? "",
      isPrivate: plan?.isPrivate ?? false,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("validation.name.required"),
      tags: Yup.array().of(Yup.string()),
      description: Yup.string(),
      sections: Yup.array().of(
        Yup.object({
          name: Yup.string().required("validation.section.name.required"),
          targetDuration: Yup.number()
            .min(0, "validation.section.targetDuration.min")
            .required("validation.section.targetDuration.required"),
          groups: Yup.array().of(
            Yup.object({
              name: Yup.string().required("validation.group.name.required"),
              items: Yup.array().of(
                Yup.object({
                  kind: Yup.string().oneOf(["break", "exercise"]).required(),

                  description: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "break"
                      ? schema.required("validation.item.description.required")
                      : schema.notRequired(),
                  ),

                  duration: Yup.number()
                    .min(1, "validation.item.duration.min")
                    .required("validation.item.duration.required"),

                  exerciseId: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "exercise"
                      ? schema.required("validation.item.exerciseId.required")
                      : schema.notRequired(),
                  ),

                  blockId: Yup.string().when(["kind"], ([kind], schema) =>
                    kind === "exercise"
                      ? schema.required("validation.item.blockId.required")
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
      if (planId) {
        const sanitizedSections = values.sections.map((section) => {
          const sanitizedGroups = section.groups?.map((group) => {
            const sanitizedItems = group.items?.map((item) => {
              if (
                typeof item._id === "string" &&
                item._id.startsWith("temp_")
              ) {
                const { _id: _omitId, ...rest } = item;
                void _omitId; // mark as used to satisfy lint
                return rest; // backend will generate a new _id
              }
              return item;
            });
            if (
              typeof group._id === "string" &&
              group._id.startsWith("temp_")
            ) {
              const { _id: _omitId, ...rest } = group;
              void _omitId; // mark as used to satisfy lint
              return {
                ...rest,
                items: sanitizedItems,
              }; // backend will generate a new _id
            }
            return {
              ...group,
              items: sanitizedItems,
            };
          });
          if (
            typeof section._id === "string" &&
            section._id.startsWith("temp_")
          ) {
            const { _id: _omitId, ...rest } = section;
            void _omitId; // mark as used to satisfy lint
            return {
              ...rest,
              groups: sanitizedGroups,
            }; // backend will generate a new _id
          }
          return {
            ...section,
            groups: sanitizedGroups,
          };
        });

        const planUpdate = {
          _id: planId,
          ...values,
          sections: sanitizedSections,
        };
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
    if (isUpdatePlanSuccess) {
      setIsEditMode(false);
    }
  }, [isUpdatePlanSuccess]);

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
            <Alert color="error">{t("errorLoadingPracticePlan")}</Alert>;
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
            placeholder={t("practicePlanName")}
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
            <Tooltip title={t("favoritePracticePlan")}>
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
              title={t("updatePracticePlan", {
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
            <Tooltip title={t("deletePracticePlan")}>
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
            <Tooltip key="favorite" title={t("favoritePracticePlan")}>
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
              title={t("updatePracticePlan", {
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
            <Tooltip key="delete" title={t("deletePracticePlan")}>
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
                {t("saving")}
              </Alert>
            )}

            {isEditMode &&
              showValidationSummary &&
              Object.keys(formik.errors).length > 0 && (
                <Alert color="warning" sx={{ mt: 2, mb: 2 }}>
                  {t("validation.fixValidationErrors")}
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
            <Card sx={{ mb: 3 }}>
              <SoftBox>
                {/* {isEditMode ? (
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
                )} */}
                {/* Description Section */}
                {formik.values.description &&
                  formik.values.description !== "" &&
                  !isEditMode && (
                    <div style={{ margin: 16 }}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <MarkdownRenderer>
                          {formik.values.description}
                        </MarkdownRenderer>
                      </Suspense>
                    </div>
                  )}

                {/* Description Edit Mode */}
                {isEditMode && (
                  <MDEditor
                    height={300}
                    value={formik.values.description || ""}
                    onChange={(value) => {
                      formik.setFieldValue(`description`, value || "");
                    }}
                  />
                )}
              </SoftBox>
            </Card>
            {/* Sections */}
            <FieldArray
              name="sections"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <SoftBox>
                  {formik.values.sections?.map((section, sectionIndex) => (
                    <PracticeSection
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
                        {t("addSection")}
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
