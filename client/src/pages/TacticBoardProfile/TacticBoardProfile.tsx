import "./translations";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  BottomNavigationAction,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  ListItem,
  List,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
  TextField,
  Box,
  ListItemText,
  Button,
  MenuItem,
} from "@mui/material";
import * as Yup from "yup";
import {
  HeaderOverflowMenu,
  SoftBox,
  SoftInput,
  SoftTypography,
} from "../../components";
import type { HeaderOverflowAction } from "../../components";
import {
  AccessLevel,
  useDeleteTacticBoardAccessMutation,
  useDeleteTacticBoardMutation,
  useEnsureTacticBoardShareLinkMutation,
  useGetTacticBoardShareLinkStatusQuery,
  useRevokeTacticBoardShareLinkMutation,
  useRotateTacticBoardShareLinkMutation,
  useDuplicateTacticBoardMutation,
  useGetAllTacticBoardAccessUsersQuery,
  useGetTacticBoardQuery,
  useUpdateTacticBoardMetaMutation,
  useShareTacticBoardMutation,
  useCheckTacticBoardAccessQuery,
} from "../../api/quadcoachApi/tacticBoardApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/IosShare";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "../../store/hooks";
import TacticBoardInProfileWrapper from "./TacticBoardInProfile";
import MDEditor from "@uiw/react-md-editor";
// No import is required in the WebPack.
import "@uiw/react-md-editor/markdown-editor.css";
// No import is required in the WebPack.
import "@uiw/react-markdown-preview/markdown.css";
import {
  FieldArray,
  FieldArrayRenderProps,
  FormikProvider,
  useFormik,
} from "formik";
import {
  canEditResource,
  canManageResource,
  TacticBoardPartialId,
} from "../../api/quadcoachApi/domain";
import AddTagDialog from "./AddTagDialog";
import Footer from "../../components/Footer";
import {
  useAddFavoriteTacticBoardMutation,
  useRemoveFavoriteTacticBoardMutation,
  useLazyGetFavoriteTacticBoardsQuery,
} from "../../api/quadcoachApi/favoriteApi";
import ShareLinkDialog from "../../components/ShareLinkDialog/ShareLinkDialog";
const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

const TacticBoardProfile = () => {
  const { t } = useTranslation("TacticBoardProfile");
  const { id: tacticBoardId } = useParams();

  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [accessMode, setAccessMode] = useState<AccessLevel>("view");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string>("");
  const { id: userId } = useAuth();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });
  const { data: authorization } = useCheckTacticBoardAccessQuery(
    tacticBoardId || "",
    { skip: !tacticBoardId || !userId },
  );
  const canEdit = canEditResource(authorization);
  const canManageResourceActions = canManageResource(authorization);
  const {
    data: shareLinkStatus,
    isLoading: isShareLinkStatusLoading,
    isFetching: isShareLinkStatusFetching,
    isError: isShareLinkStatusError,
  } = useGetTacticBoardShareLinkStatusQuery(tacticBoardId || "", {
    skip: !tacticBoardId || !canEdit || !tacticBoard?.isPrivate,
  });
  const isShareLinkStatusPending =
    isShareLinkStatusLoading || isShareLinkStatusFetching;

  const [
    updateTacticBoardMeta,
    {
      isLoading: isUpdateTacticBoardMetaLoading,
      isError: isUpdateTacticBoardMetaError,
      error: updateError,
    },
  ] = useUpdateTacticBoardMetaMutation();
  const [
    deleteTacticBoard,
    {
      isError: isDeleteTacticBoardError,
      isLoading: isDeleteTacticBoardLoading,
      isSuccess: isDeleteTacticBoardSuccess,
      error: deleteError,
    },
  ] = useDeleteTacticBoardMutation();
  const [
    addFavoriteTacticBoard,
    { isLoading: isAddFavoriteTacticBoardLoading },
  ] = useAddFavoriteTacticBoardMutation();
  const [
    removeFavoriteTacticBoard,
    { isLoading: isRemoveFavoriteTacticBoardLoading },
  ] = useRemoveFavoriteTacticBoardMutation();

  const [getFavoriteTacticBoards, { data: favoriteTacticBoards }] =
    useLazyGetFavoriteTacticBoardsQuery();

  const [shareTacticBoard, { isLoading: isShareTacticBoardLoading }] =
    useShareTacticBoardMutation();

  const [ensureShareLink, { isLoading: isEnsureShareLinkLoading }] =
    useEnsureTacticBoardShareLinkMutation();
  const [rotateShareLink, { isLoading: isRotateShareLinkLoading }] =
    useRotateTacticBoardShareLinkMutation();
  const [revokeShareLink, { isLoading: isRevokeShareLinkLoading }] =
    useRevokeTacticBoardShareLinkMutation();
  const [duplicateTacticBoard, { isLoading: isDuplicateTacticBoardLoading }] =
    useDuplicateTacticBoardMutation();

  const { data: accessUsers } = useGetAllTacticBoardAccessUsersQuery(
    tacticBoardId || "",
    { skip: !tacticBoardId || !canManageResourceActions },
  );

  const [
    deleteTacticBoardAccess,
    { isLoading: isDeleteTacticBoardAccessLoading },
  ] = useDeleteTacticBoardAccessMutation();

  useEffect(() => {
    if (userId) {
      getFavoriteTacticBoards({ userId });
    }
  }, [userId, getFavoriteTacticBoards]);

  const formik = useFormik<TacticBoardPartialId>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: {
      name: tacticBoard?.name ?? "",
      pages: tacticBoard?.pages ?? [],
      isPrivate: tacticBoard?.isPrivate ?? false,
      tags: tacticBoard?.tags ?? [],
      creator: tacticBoard?.creator ?? "",
      description: tacticBoard?.description ?? "",
      coaching_points: tacticBoard?.coaching_points ?? "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("TacticBoardProfile:info.name.missing"),
      tags: Yup.array().of(Yup.string()),
      isPrivate: Yup.boolean(),
      description: Yup.string(),
      coaching_points: Yup.string(),
    }),

    onSubmit: (values) => {
      if (tacticBoardId) {
        const {
          name,
          isPrivate,
          tags,
          description,
          user,
          creator,
          coaching_points,
        } = values;
        updateTacticBoardMeta({
          tacticBoardId,
          metaData: {
            name,
            isPrivate,
            creator,
            user,
            tags,
            description,
            coaching_points,
          },
        });
      }
    },
  });

  useEffect(() => {
    if (favoriteTacticBoards) {
      setIsFavorite(
        favoriteTacticBoards.some(
          (favoriteTacticBoard) =>
            favoriteTacticBoard.tacticBoardId === tacticBoardId,
        ),
      );
    }
  }, [favoriteTacticBoards, setIsFavorite, tacticBoardId]);

  const onDeleteTacticBoardClick = () => {
    if (!tacticBoard) return;
    deleteTacticBoard(tacticBoard._id);
  };
  useEffect(() => {
    if (!isDeleteTacticBoardSuccess) return;
    navigate("/tacticboards");
  }, [isDeleteTacticBoardSuccess, navigate]);

  const handleAddTagConfirm = (
    arrayHelpers: FieldArrayRenderProps,
    selectedTagToAdd?: string[],
  ) => {
    if (selectedTagToAdd?.length) {
      const notAddedTags = selectedTagToAdd.filter(
        (newTag) =>
          !formik.values.tags ||
          !formik.values.tags.some((rel) => rel == newTag),
      );

      notAddedTags.forEach((newTag) => arrayHelpers.push(newTag));
    }

    setOpenTagDialog(false);
  };

  const handleAddAccess = async () => {
    if (!tacticBoardId || !userEmail.trim()) {
      setEmailError("Email is required");
      return;
    }

    setEmailError("");

    try {
      await shareTacticBoard({
        tacticBoardId,
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

  const onDuplicateTacticBoardClick = async () => {
    if (!tacticBoardId) return;

    setDuplicateError("");

    try {
      const response = await duplicateTacticBoard(tacticBoardId).unwrap();
      navigate(`/tacticboards/${response._id}`);
    } catch (error) {
      console.error("Failed to duplicate Tactic Board", error);
      setDuplicateError(t("TacticBoardProfile:errorDuplicatingTacticBoard"));
    }
  };

  if (isTacticBoardLoading) {
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

  if (!tacticBoard || isTacticBoardError) {
    return (
      <DashboardLayout>
        {() => (
          <>
            <Alert color="error">
              {t("TacticBoardProfile:errorLoadingTacticBoard")}
            </Alert>
          </>
        )}
      </DashboardLayout>
    );
  }

  const canDuplicateTacticBoard =
    Boolean(userId) && userId !== "" && Boolean(tacticBoardId);
  const tacticBoardMenuActions: HeaderOverflowAction[] = [];

  if (canEdit && tacticBoard.isPrivate) {
    tacticBoardMenuActions.push({
      key: "share",
      label: t("TacticBoardProfile:menu.manageShareLink"),
      onClick: onShareClick,
      icon: <ShareIcon fontSize="small" />,
      disabled:
        isEnsureShareLinkLoading ||
        isRotateShareLinkLoading ||
        isRevokeShareLinkLoading,
    });
  }

  if (canDuplicateTacticBoard) {
    tacticBoardMenuActions.push({
      key: "duplicate",
      label: t("TacticBoardProfile:menu.duplicate"),
      onClick: onDuplicateTacticBoardClick,
      icon: <ContentCopyIcon fontSize="small" />,
      disabled: isDuplicateTacticBoardLoading,
    });
  }

  if (canManageResourceActions) {
    tacticBoardMenuActions.push({
      key: "delete",
      label: t("TacticBoardProfile:menu.delete"),
      onClick: onDeleteTacticBoardClick,
      icon: <DeleteIcon fontSize="small" />,
      disabled:
        !tacticBoard ||
        isDeleteTacticBoardLoading ||
        isUpdateTacticBoardMetaLoading,
      color: "error",
    });
  }

  return (
    <FormikProvider value={formik}>
      <ProfileLayout
        title={
          isEditMode ? (
            <SoftInput
              error={formik.touched.name && Boolean(formik.errors.name)}
              name="name"
              required
              id="outlined-basic"
              placeholder={t("TacticBoardProfile:info.name.placeholder")}
              value={formik.values.name}
              onChange={formik.handleChange}
              fullWidth
              onBlur={formik.handleBlur}
            />
          ) : (
            tacticBoard?.name
          )
        }
        isDataLoading={isTacticBoardLoading}
        showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
        headerAction={
          <>
            <SoftBox display="flex">
              {userId && userId !== "" && tacticBoardId && (
                <Tooltip title={t("TacticBoardProfile:favoriteTacticBoard")}>
                  <IconButton
                    disabled={
                      isAddFavoriteTacticBoardLoading ||
                      isRemoveFavoriteTacticBoardLoading
                    }
                    onClick={() => {
                      if (isFavorite) {
                        removeFavoriteTacticBoard({
                          tacticBoardId,
                          userId: userId,
                        });
                      } else {
                        addFavoriteTacticBoard({
                          tacticBoardId,
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
                <Tooltip title={t("TacticBoardProfile:editTacticBoardMeta")}>
                  <IconButton
                    onClick={() => {
                      setIsEditMode(!isEditMode);

                      if (isEditMode && formik.isValid) {
                        formik.submitForm().then(() => {});
                      }
                    }}
                    color="primary"
                  >
                    {isEditMode ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
              )}
              {tacticBoardMenuActions.length > 0 && (
                <HeaderOverflowMenu
                  actions={tacticBoardMenuActions}
                  tooltip={t("TacticBoardProfile:menu.more")}
                  disabled={tacticBoardMenuActions.every(
                    (action) => action.disabled,
                  )}
                />
              )}
            </SoftBox>
          </>
        }
        bottomNavigation={
          !isUpMd && [
            userId && userId !== "" && tacticBoardId && (
              <Tooltip
                key="favorite"
                title={t("TacticBoardProfile:favoriteTacticBoard")}
              >
                <BottomNavigationAction
                  icon={
                    <FavoriteIcon color={isFavorite ? "error" : "inherit"} />
                  }
                  disabled={
                    isAddFavoriteTacticBoardLoading ||
                    isRemoveFavoriteTacticBoardLoading
                  }
                  onClick={() => {
                    if (isFavorite) {
                      removeFavoriteTacticBoard({
                        tacticBoardId,
                        userId: userId,
                      });
                    } else {
                      addFavoriteTacticBoard({
                        tacticBoardId,
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
                title={t("TacticBoardProfile:editTacticBoardMeta")}
              >
                <BottomNavigationAction
                  icon={<EditIcon />}
                  onClick={() => {
                    setIsEditMode(!isEditMode);

                    if (isEditMode && formik.isValid) {
                      formik.submitForm().then(() => {});
                    }
                  }}
                />
              </Tooltip>
            ),
          ]
        }
      >
        {() => (
          <>
            {duplicateError && (
              <Alert color="error" sx={{ mt: 5, mb: 3 }}>
                {duplicateError}
              </Alert>
            )}
            {isDeleteTacticBoardError && (
              <Alert color="error" sx={{ mt: 5, mb: 3 }}>
                {t("TacticBoardProfile:errorDeletingTacticBoard")}
                {(
                  deleteError as {
                    data?: { exercises?: Array<{ id: string; name: string }> };
                  }
                )?.data?.exercises && (
                  <div>
                    {t("TacticBoardProfile:usedInExercises")}
                    {(
                      deleteError as {
                        data?: {
                          exercises?: Array<{ id: string; name: string }>;
                        };
                      }
                    )?.data?.exercises?.map((exercise) => (
                      <div key={exercise.id}>{exercise.name}</div>
                    ))}
                  </div>
                )}
              </Alert>
            )}
            {isUpdateTacticBoardMetaError && (
              <Alert color="error" sx={{ mt: 5, mb: 3 }}>
                {t("TacticBoardProfile:errorUpdatingTacticBoard")}
                {(
                  updateError as {
                    data?: { exercises?: Array<{ id: string; name: string }> };
                  }
                )?.data?.exercises && (
                  <div>
                    {t("TacticBoardProfile:usedInExercises")}
                    {(
                      updateError as {
                        data?: {
                          exercises?: Array<{ id: string; name: string }>;
                        };
                      }
                    )?.data?.exercises?.map((exercise) => (
                      <div key={exercise.id}>{exercise.name}</div>
                    ))}
                  </div>
                )}
              </Alert>
            )}
            <Card sx={{ height: "100%" }}>
              {/* <CardHeader title={t("TacticBoardProfile:info.title")} /> */}
              <TacticBoardInProfileWrapper
                tacticBoardId={tacticBoardId}
                isEditMode={isEditMode}
                onEditClick={() => {
                  if (formik.isValid) {
                    formik.submitForm().then(() => {
                      navigate(`/tacticboards/${tacticBoardId}/update`);
                    });
                  } else {
                    navigate(`/tacticboards/${tacticBoardId}/update`);
                  }
                }}
              />
              {(Boolean(tacticBoard?.tags) || Boolean(tacticBoard?.creator)) &&
                !isEditMode && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {t("TacticBoardProfile:info.title")}
                    </AccordionSummary>
                    <AccordionDetails sx={{ ml: 1 }}>
                      <FormGroup>
                        <SoftTypography variant="body2">
                          {t("TacticBoardProfile:info.tags.label")}
                        </SoftTypography>
                        <FieldArray
                          name="tags"
                          render={() => {
                            return (
                              <div>
                                {formik.values.tags &&
                                  formik.values.tags?.length > 0 &&
                                  formik.values.tags?.map((el, index) => {
                                    if (el != "") {
                                      return (
                                        <Chip
                                          size="small"
                                          key={el + index}
                                          label={el}
                                          sx={{ margin: "2px" }}
                                          variant={"outlined"}
                                        />
                                      );
                                    }
                                  })}
                                {formik.values.tags?.length == 0 &&
                                  t("info.tags.none")}
                              </div>
                            );
                          }}
                        />
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                )}
              {isEditMode && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:info.title")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid item xs={12} p={1}>
                      <FormGroup>
                        <FormControlLabel
                          sx={{ p: 1 }}
                          control={
                            <Checkbox
                              checked={formik.values.isPrivate}
                              onChange={formik.handleChange}
                              name="isPrivate"
                            />
                          }
                          label={
                            <SoftTypography variant="body2">
                              {t("TacticBoardProfile:info.isPrivate.label")}
                            </SoftTypography>
                          }
                        />
                      </FormGroup>
                    </Grid>
                    <Grid item xs={12} p={1}>
                      <FormGroup>
                        <SoftTypography variant="body2">
                          {t("TacticBoardProfile:info.tags.label")}
                        </SoftTypography>
                        <FieldArray
                          name="tags"
                          render={(arrayHelpers) => {
                            return (
                              <div>
                                {formik.values.tags?.map((el, index) => {
                                  if (el != "") {
                                    return (
                                      <Chip
                                        size="small"
                                        key={el + index}
                                        label={el}
                                        sx={{ margin: "2px" }}
                                        variant={"outlined"}
                                        onDelete={() => {
                                          arrayHelpers.remove(index);
                                        }}
                                      />
                                    );
                                  }
                                })}
                                <Chip
                                  size="small"
                                  label="+"
                                  sx={{ margin: "2px" }}
                                  color="info"
                                  onClick={() => {
                                    setOpenTagDialog(true);
                                  }}
                                />
                                <AddTagDialog
                                  isOpen={openTagDialog}
                                  onConfirm={(selectedTag) =>
                                    handleAddTagConfirm(
                                      arrayHelpers,
                                      selectedTag,
                                    )
                                  }
                                  alreadyAddedTags={[
                                    ...(formik.values.tags
                                      ? formik.values.tags
                                      : []),
                                  ]}
                                />
                              </div>
                            );
                          }}
                        />
                      </FormGroup>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(tacticBoard?.description) && !isEditMode && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:description")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <MarkdownRenderer>
                        {tacticBoard?.description ?? ""}
                      </MarkdownRenderer>
                    </Suspense>
                  </AccordionDetails>
                </Accordion>
              )}
              {isEditMode && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:description")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDEditor
                      height={300}
                      value={formik.values.description}
                      onChange={(value) => {
                        formik.setFieldValue(`description`, value);
                      }}
                      onBlur={formik.handleBlur}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(tacticBoard?.coaching_points) && !isEditMode && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:coaching_points")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <MarkdownRenderer>
                        {tacticBoard?.coaching_points ?? ""}
                      </MarkdownRenderer>
                    </Suspense>
                  </AccordionDetails>
                </Accordion>
              )}
              {isEditMode && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:coaching_points")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDEditor
                      height={300}
                      value={formik.values.coaching_points}
                      onChange={(value) => {
                        formik.setFieldValue(`coaching_points`, value);
                      }}
                      onBlur={formik.handleBlur}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
              {isEditMode && canManageResourceActions && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("TacticBoardProfile:access.title")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <TextField
                          size="small"
                          label={t("TacticBoardProfile:access.add_user")}
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
                          label={t("TacticBoardProfile:access.mode")}
                          value={accessMode}
                          onChange={(event) =>
                            setAccessMode(event.target.value as AccessLevel)
                          }
                          sx={{
                            minWidth: 100,
                            width: 200,
                            "& .MuiInputBase-root": {
                              height: "40px",
                            },
                            "& .MuiInputBase-input": {
                              padding: "8.5px 14px",
                            },
                          }}
                        >
                          <MenuItem value="edit">
                            {t("TacticBoardProfile:access.edit")}
                          </MenuItem>
                          <MenuItem value="view">
                            {t("TacticBoardProfile:access.view")}
                          </MenuItem>
                        </TextField>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={
                            isShareTacticBoardLoading || !userEmail.trim()
                          }
                          onClick={handleAddAccess}
                        >
                          {t("TacticBoardProfile:access.add")}
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
                                disabled={isDeleteTacticBoardAccessLoading}
                                onClick={() => {
                                  if (tacticBoardId) {
                                    deleteTacticBoardAccess({
                                      tacticBoardId,
                                      userId: entry.user._id,
                                    });
                                  }
                                }}
                              >
                                {t("common:remove")}
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
                  </AccordionDetails>
                </Accordion>
              )}
            </Card>
            <Footer />
            <ShareLinkDialog
              open={isShareDialogOpen}
              onClose={() => setIsShareDialogOpen(false)}
              resourceId={tacticBoardId || ""}
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
                title: t("TacticBoardProfile:shareDialog.title"),
                error: t("TacticBoardProfile:shareDialog.error"),
                inactive: t("TacticBoardProfile:shareDialog.inactive"),
                copy: t("TacticBoardProfile:shareDialog.copy"),
                close: t("TacticBoardProfile:shareDialog.close"),
                create: t("TacticBoardProfile:shareDialog.create"),
                rotate: t("TacticBoardProfile:shareDialog.rotate"),
                revoke: t("TacticBoardProfile:shareDialog.revoke"),
              }}
            />
          </>
        )}
      </ProfileLayout>
    </FormikProvider>
  );
};

export default TacticBoardProfile;
