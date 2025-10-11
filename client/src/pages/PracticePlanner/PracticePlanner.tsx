import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { useAppDispatch, useAppSelector, useAuth } from "../../store/hooks";
import { useEffect, useRef, useState } from "react";
import { SoftBox, SoftInput } from "../../components";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import * as Yup from "yup";
import { useFormik } from "formik";
import { PracticePlanEntityPartialId } from "../../api/quadcoachApi/domain/PracticePlan";

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
                  description: Yup.string().when("kind", {
                    is: "break",
                    then: Yup.string().required(
                      "Exercise:validation.item.description.required",
                    ),
                    otherwise: Yup.string().notRequired(),
                  }),
                  duration: Yup.number()
                    .min(1, "Exercise:validation.item.duration.min")
                    .required("Exercise:validation.item.duration.required"),
                  exerciseId: Yup.string().when("kind", {
                    is: "exercise",
                    then: Yup.string().required(
                      "Exercise:validation.item.exerciseId.required",
                    ),
                    otherwise: Yup.string().notRequired(),
                  }),
                  blockId: Yup.string().when("kind", {
                    is: "exercise",
                    then: Yup.string().required(
                      "Exercise:validation.item.blockId.required",
                    ),
                    otherwise: Yup.string().notRequired(),
                  }),
                }),
              ),
            }),
          ),
        }),
      ),
    }),
    onSubmit: async (values) => {
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
      {(scrollTrigger) => <p></p>}
    </ProfileLayout>
  );
};

export default PracticePlanner;
