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
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
  TextField,
  Box,
  Button,
  MenuItem,
} from "@mui/material";

import {
  useGetPracticePlanQuery,
  useGetSharedPracticePlanQuery,
  usePatchPracticePlanMutation,
  useGetAllPracticePlanAccessUsersQuery,
  useDeletePracticePlanMutation,
  useSharePracticePlanMutation,
  useEnsurePracticePlanShareLinkMutation,
  useGetPracticePlanShareLinkStatusQuery,
  useRevokePracticePlanShareLinkMutation,
  useRotatePracticePlanShareLinkMutation,
  useRemovePracticePlanAccessMutation,
  useCheckPracticePlanAccessQuery,
  AccessLevel,
} from "../../api/quadcoachApi/practicePlansApi";
import {
  useAddFavoritePracticePlanMutation,
  useRemoveFavoritePracticePlanMutation,
  useLazyGetFavoritePracticePlansQuery,
} from "../../api/quadcoachApi/favoriteApi";
import { useAuth } from "../../store/hooks";
import { useEffect, useRef, useState } from "react";
import {
  HeaderOverflowMenu,
  SoftBox,
  SoftButton,
  SoftInput,
  SoftTypography,
} from "../../components";
import type { HeaderOverflowAction } from "../../components";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/IosShare";

import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import * as Yup from "yup";
import { useFormik } from "formik";

import { FieldArray, FieldArrayRenderProps, FormikProvider } from "formik";
import { PracticePlanEntityPartialId } from "../../api/quadcoachApi/domain/PracticePlan";
import {
  canEditResource,
  canManageResource,
} from "../../api/quadcoachApi/domain";
import PracticeSection from "./PracticeSection";
import { lazy, Suspense, useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { toReadOnlyPracticePlan } from "../../api/quadcoachApi/shareLink";
import ShareLinkDialog from "../../components/ShareLinkDialog/ShareLinkDialog";

const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

type PracticePlannerProps = {
  sharedToken?: string;
};

const PracticePlanner = ({
  sharedToken,
}: PracticePlannerProps): JSX.Element => {
  const { t } = useTranslation("PracticePlanner");
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { id: userId } = useAuth();
  const autoEditAppliedRef = useRef(false);
  // Track whether to show validation summary (only after failed save attempt)
  const [showValidationSummary, setShowValidationSummary] =
    useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  // Access management state
  const [accessMode, setAccessMode] = useState<AccessLevel>("view");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  const { planId, token } = useParams<{ planId: string; token: string }>();
  const effectiveSharedToken = sharedToken || token || "";
  const isSharedMode = effectiveSharedToken !== "";

  const {
    data: ownPlan,
    isLoading: isOwnPlanLoading,
    isError: isOwnPlanError,
  } = useGetPracticePlanQuery(planId || "", {
    skip: !planId || isSharedMode,
  });

  const {
    data: sharedPlan,
    isLoading: isSharedPlanLoading,
    isError: isSharedPlanError,
  } = useGetSharedPracticePlanQuery(effectiveSharedToken, {
    skip: !isSharedMode,
  });

  const readOnlySharedPlan = useMemo(
    () => (sharedPlan ? toReadOnlyPracticePlan(sharedPlan) : undefined),
    [sharedPlan],
  );
  const plan = isSharedMode ? readOnlySharedPlan : ownPlan;
  const isPlanLoading = isSharedMode ? isSharedPlanLoading : isOwnPlanLoading;
  const isPlanError = isSharedMode ? isSharedPlanError : isOwnPlanError;
  const currentPlanId = planId || plan?._id;
  const { data: authorization } = useCheckPracticePlanAccessQuery(
    currentPlanId || "",
    { skip: !currentPlanId || !userId || isSharedMode },
  );
  const canEdit = canEditResource(authorization);
  const canManageResourceActions = canManageResource(authorization);
  const {
    data: shareLinkStatus,
    isLoading: isShareLinkStatusLoading,
    isFetching: isShareLinkStatusFetching,
    isError: isShareLinkStatusError,
  } = useGetPracticePlanShareLinkStatusQuery(currentPlanId || "", {
    skip: !currentPlanId || !canEdit || !plan?.isPrivate || isSharedMode,
  });
  const isShareLinkStatusPending =
    isShareLinkStatusLoading || isShareLinkStatusFetching;
  const [
    updatePlan,
    { isLoading: isUpdatePlanLoading, isSuccess: isUpdatePlanSuccess },
  ] = usePatchPracticePlanMutation();
  const [deletePlan, { isLoading: isDeletePlanLoading }] =
    useDeletePracticePlanMutation();
  const onDeletePlanClick = () => {
    if (!currentPlanId) return;
    deletePlan(currentPlanId);
    navigate("/practice-plans");
  };

  const [getFavoritePlans, { data: favoritePlans }] =
    useLazyGetFavoritePracticePlansQuery();

  const [addFavoritePlan, { isLoading: isAddFavoritePlanLoading }] =
    useAddFavoritePracticePlanMutation();
  const [removeFavoritePlan, { isLoading: isRemoveFavoritePlanLoading }] =
    useRemoveFavoritePracticePlanMutation();

  const { data: accessUsers } = useGetAllPracticePlanAccessUsersQuery(
    currentPlanId || "",
    { skip: !currentPlanId || !canManageResourceActions },
  );

  const [sharePracticePlan, { isLoading: isSharePracticePlanLoading }] =
    useSharePracticePlanMutation();

  const [ensureShareLink, { isLoading: isEnsureShareLinkLoading }] =
    useEnsurePracticePlanShareLinkMutation();
  const [rotateShareLink, { isLoading: isRotateShareLinkLoading }] =
    useRotatePracticePlanShareLinkMutation();
  const [revokeShareLink, { isLoading: isRevokeShareLinkLoading }] =
    useRevokePracticePlanShareLinkMutation();

  const [
    removePracticePlanAccess,
    { isLoading: isRemovePracticePlanAccessLoading },
  ] = useRemovePracticePlanAccessMutation();

  useEffect(() => {
    if (userId) {
      getFavoritePlans({ userId });
    }
  }, [userId, getFavoritePlans]);

  useEffect(() => {
    if (favoritePlans && currentPlanId) {
      setIsFavorite(
        favoritePlans.some(
          (favoritePlan) => favoritePlan.practicePlan === currentPlanId,
        ),
      );
    }
  }, [favoritePlans, setIsFavorite, currentPlanId]);
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
        } catch {
          // Error alert handled by isUpdateExerciseError condition
        }
      }
    },
  });

  // Auto-enter edit mode if URL has ?edit=1 and user is privileged (runs after formik init)
  useEffect(() => {
    if (autoEditAppliedRef.current) return;
    if (!isEditMode && canEdit) {
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
  }, [location.search, canEdit, isEditMode, formik, location.pathname]);

  // Edit mode toggle functionality
  const onToggleEditMode = async () => {
    if (!canEdit) return;
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

  const handleAddAccess = async () => {
    if (!planId || !userEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    setEmailError("");

    try {
      await sharePracticePlan({
        practicePlan: planId,
        email: userEmail.trim(),
        access: accessMode,
      }).unwrap();

      setUserEmail("");
    } catch (error: unknown) {
      if ((error as { status?: number })?.status === 404) {
        setEmailError("User not found with this email");
      } else {
        setEmailError("Failed to add user access");
      }
    }
  };

  const onShareClick = () => {
    setIsShareDialogOpen(true);
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
  if (!plan || isPlanError || (!planId && !isSharedMode)) {
    return (
      <DashboardLayout>
        {() => (
          <>
            <Alert color="error">{t("errorLoadingPracticePlan")}</Alert>
          </>
        )}
      </DashboardLayout>
    );
  }

  const practicePlanMenuActions: HeaderOverflowAction[] = [];

  if (canEdit && plan.isPrivate) {
    practicePlanMenuActions.push({
      key: "share",
      label: t("menu.manageShareLink"),
      onClick: onShareClick,
      icon: <ShareIcon fontSize="small" />,
      disabled:
        isEnsureShareLinkLoading ||
        isRotateShareLinkLoading ||
        isRevokeShareLinkLoading,
    });
  }

  if (canManageResourceActions) {
    practicePlanMenuActions.push({
      key: "delete",
      label: t("menu.delete"),
      onClick: onDeletePlanClick,
      icon: <DeleteIcon fontSize="small" />,
      disabled: !plan || isDeletePlanLoading,
      color: "error",
    });
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
      isDataLoading={isPlanLoading}
      headerAction={
        <SoftBox display="flex">
          {userId && userId !== "" && currentPlanId && (
            <Tooltip title={t("favoritePracticePlan")}>
              <IconButton
                disabled={
                  isAddFavoritePlanLoading || isRemoveFavoritePlanLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoritePlan({
                      practicePlanId: currentPlanId,
                      userId: userId,
                    });
                  } else {
                    addFavoritePlan({
                      practicePlanId: currentPlanId,
                      userId: userId,
                    });
                  }
                }}
              >
                <FavoriteIcon color={isFavorite ? "error" : "inherit"} />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
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
          {practicePlanMenuActions.length > 0 && (
            <HeaderOverflowMenu
              actions={practicePlanMenuActions}
              tooltip={t("menu.more")}
              disabled={practicePlanMenuActions.every(
                (action) => action.disabled,
              )}
            />
          )}
        </SoftBox>
      }
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
      bottomNavigation={
        !isUpMd && [
          userId && userId !== "" && currentPlanId && (
            <Tooltip key="favorite" title={t("favoritePracticePlan")}>
              <BottomNavigationAction
                icon={<FavoriteIcon color={isFavorite ? "error" : "inherit"} />}
                disabled={
                  isAddFavoritePlanLoading || isRemoveFavoritePlanLoading
                }
                onClick={() => {
                  if (isFavorite) {
                    removeFavoritePlan({
                      practicePlanId: currentPlanId,
                      userId: userId,
                    });
                  } else {
                    addFavoritePlan({
                      practicePlanId: currentPlanId,
                      userId: userId,
                    });
                  }
                }}
              />
            </Tooltip>
          ),
          canEdit && (
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

            {/* Visibility and Access management */}
            {isEditMode && (
              <Card sx={{ mb: 3 }}>
                <SoftBox p={3}>
                  <SoftTypography variant="h6" fontWeight="medium" mb={2}>
                    {t("access.title")}
                  </SoftTypography>

                  {/* Private Flag */}
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.isPrivate}
                          onChange={formik.handleChange}
                          name="isPrivate"
                        />
                      }
                      label={
                        <SoftTypography variant="body2">
                          {t("access.isPrivate.label")}
                        </SoftTypography>
                      }
                    />
                  </FormGroup>

                  {/* User Access Management */}
                  {canManageResourceActions && (
                    <Box sx={{ mt: 3 }}>
                      <SoftTypography
                        variant="body2"
                        fontWeight="medium"
                        mb={2}
                      >
                        {t("access.manageUsers")}
                      </SoftTypography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <TextField
                          size="small"
                          label={t("access.add_user")}
                          placeholder="Enter user email"
                          value={userEmail}
                          onChange={(e) => {
                            setUserEmail(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          error={!!emailError}
                          helperText={emailError}
                          sx={{
                            flex: 1,
                            minWidth: 250,
                            "& .MuiInputBase-root": {
                              height: "40px",
                            },
                            "& .MuiInputBase-input": {
                              padding: "8.5px 14px",
                            },
                          }}
                        />
                        <TextField
                          select
                          size="small"
                          label={t("access.mode")}
                          value={accessMode}
                          onChange={(event) =>
                            setAccessMode(event.target.value as AccessLevel)
                          }
                          sx={{
                            minWidth: 120,
                            width: 120,
                            "& .MuiInputBase-root": {
                              height: "40px",
                            },
                            "& .MuiInputBase-input": {
                              padding: "8.5px 14px",
                            },
                          }}
                        >
                          <MenuItem value="edit">{t("access.edit")}</MenuItem>
                          <MenuItem value="view">{t("access.view")}</MenuItem>
                        </TextField>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            isSharePracticePlanLoading || !userEmail.trim()
                          }
                          onClick={handleAddAccess}
                          sx={{ height: "40px", minWidth: "80px" }}
                        >
                          {t("access.add")}
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
                                disabled={isRemovePracticePlanAccessLoading}
                                onClick={() => {
                                  if (planId) {
                                    removePracticePlanAccess({
                                      practicePlan: planId,
                                      userId: entry.user._id,
                                    });
                                  }
                                }}
                              >
                                {t("access.remove")}
                              </Button>
                            }
                          >
                            <ListItemText
                              primary={
                                entry.user.name + " (" + entry.access + ")"
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </SoftBox>
              </Card>
            )}

            {/* Description Field */}
            <Card sx={{ mb: 3 }}>
              <SoftBox>
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
                          const sections = JSON.parse(
                            JSON.stringify(formik.values.sections),
                          );
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
                          const sections = JSON.parse(
                            JSON.stringify(formik.values.sections),
                          );
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
            <ShareLinkDialog
              open={isShareDialogOpen}
              onClose={() => setIsShareDialogOpen(false)}
              resourceId={currentPlanId || ""}
              status={shareLinkStatus}
              isStatusPending={isShareLinkStatusPending}
              isStatusError={isShareLinkStatusError}
              isEnsurePending={isEnsureShareLinkLoading}
              isRotatePending={isRotateShareLinkLoading}
              isRevokePending={isRevokeShareLinkLoading}
              ensure={ensureShareLink}
              rotate={rotateShareLink}
              revoke={revokeShareLink}
              labels={{
                title: t("share.dialog.title"),
                error: t("share.dialog.error"),
                inactive: t("share.dialog.inactive"),
                copy: t("share.dialog.copy"),
                close: t("share.dialog.close"),
                create: t("share.dialog.create"),
                rotate: t("share.dialog.rotate"),
                revoke: t("share.dialog.revoke"),
              }}
            />
          </>
        </FormikProvider>
      )}
    </ProfileLayout>
  );
};

export default PracticePlanner;
