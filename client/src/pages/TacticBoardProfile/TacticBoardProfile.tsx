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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
} from "@mui/material";
import * as Yup from "yup";
import { SoftBox, SoftInput, SoftTypography } from "../../components";
import {
  AccessLevel,
  useDeleteTacticboardAccessMutation,
  useDeleteTacticBoardMutation,
  useGetAllTacticboardAccessUsersQuery,
  useGetTacticBoardQuery,
  useUpdateTacticBoardMetaMutation,
  useShareTacticBoardMutation,
  useDuplicateTacticBoardMutation,
} from "../../api/quadcoachApi/tacticboardApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import { TacticBoardPartialId } from "../../api/quadcoachApi/domain";
import AddTagDialog from "./AddTagDialog";
import Footer from "../../components/Footer";
import {
  useAddFavoriteTacticboardMutation,
  useRemoveFavoriteTacticboardMutation,
  useLazyGetFavoriteTacticboardsQuery,
} from "../../api/quadcoachApi/favoriteApi";
const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

const TacticBoardProfile = () => {
  const { t } = useTranslation("TacticBoardProfile");
  const { id: tacticBoardId } = useParams();

  const navigate = useNavigate();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [accessMode, setAccessMode] = useState<AccessLevel>("view");
  const [userEmail, setUserEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [openDuplicateDialog, setOpenDuplicateDialog] = useState<boolean>(false);
  const [duplicateName, setDuplicateName] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { id: userId, roles: userRoles } = useAuth();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

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
    addFavoriteTacticboard,
    { isLoading: isAddFavoriteTacticboardLoading },
  ] = useAddFavoriteTacticboardMutation();
  const [
    removeFavoriteTacticboard,
    { isLoading: isRemoveFavoriteTacticboardLoading },
  ] = useRemoveFavoriteTacticboardMutation();

  const [getFavoriteTacticboards, { data: favoriteTacticboards }] =
    useLazyGetFavoriteTacticboardsQuery();

  const [shareTacticBoard, { isLoading: isShareTacticBoardLoading }] =
    useShareTacticBoardMutation();

  const { data: accessUsers } = useGetAllTacticboardAccessUsersQuery(
    tacticBoardId || "",
  );

  const [
    deleteTacticboardAccess,
    { isLoading: isDeleteTacticboardAccessLoading },
  ] = useDeleteTacticboardAccessMutation();

  const [
    duplicateTacticBoard,
    {
      isLoading: isDuplicateTacticBoardLoading,
      isError: isDuplicateTacticBoardError,
      isSuccess: isDuplicateTacticBoardSuccess,
      data: duplicateData,
    },
  ] = useDuplicateTacticBoardMutation();

  useEffect(() => {
    if (userId) {
      getFavoriteTacticboards({ userId });
    }
  }, [userId, getFavoriteTacticboards]);

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
          tacticboardId: tacticBoardId,
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
    if (
      tacticBoard?.user?.toString() === userId ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    } else {
      if (accessUsers) {
        setIsPrivileged(
          accessUsers.some((user) => {
            return (
              user.user._id.toString() === userId && user.access === "edit"
            );
          }),
        );
      }
    }
  }, [tacticBoard, userId, userRoles, accessUsers]);

  const isCreator =
    tacticBoard?.user?.toString() === userId ||
    userRoles.includes("Admin") ||
    userRoles.includes("admin");

  useEffect(() => {
    if (favoriteTacticboards) {
      setIsFavorite(
        favoriteTacticboards.some(
          (favoriteTacticboard) =>
            favoriteTacticboard.tacticboard === tacticBoardId,
        ),
      );
    }
  }, [favoriteTacticboards, setIsFavorite, tacticBoardId]);

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
        tacticboardId: tacticBoardId,
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

  const handleDuplicateClick = () => {
    setDuplicateName(tacticBoard?.name ? `${tacticBoard.name} (Copy)` : "");
    setOpenDuplicateDialog(true);
    setAnchorEl(null);
  };

  const handleDuplicateConfirm = async () => {
    if (!tacticBoardId || !duplicateName.trim()) {
      return;
    }

    try {
      await duplicateTacticBoard({
        tacticboardId: tacticBoardId,
        name: duplicateName.trim(),
      }).unwrap();
      setOpenDuplicateDialog(false);
      setDuplicateName("");
    } catch (error) {
      console.error("Error duplicating tacticboard:", error);
    }
  };

  const handleDuplicateCancel = () => {
    setOpenDuplicateDialog(false);
    setDuplicateName("");
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (isDuplicateTacticBoardSuccess && duplicateData?._id) {
      navigate(`/tacticboards/${duplicateData._id}`);
    }
  }, [isDuplicateTacticBoardSuccess, duplicateData, navigate]);

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
        //headerBackgroundImage={headerBackgroundImage}
        isDataLoading={isTacticBoardLoading}
        showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
        headerAction={
          <>
            <SoftBox display="flex">
              {userId && userId !== "" && tacticBoardId && (
                <Tooltip title={t("TacticBoardProfile:favoriteTacticBoard")}>
                  <IconButton
                    disabled={
                      isAddFavoriteTacticboardLoading ||
                      isRemoveFavoriteTacticboardLoading
                    }
                    onClick={() => {
                      if (isFavorite) {
                        removeFavoriteTacticboard({
                          tacticboardId: tacticBoardId,
                          userId: userId,
                        });
                      } else {
                        addFavoriteTacticboard({
                          tacticboardId: tacticBoardId,
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
              {userId && userId !== "" && tacticBoardId && (
                <Tooltip title={t("TacticBoardProfile:duplicateTacticBoard")}>
                  <IconButton
                    onClick={handleDuplicateClick}
                    disabled={isDuplicateTacticBoardLoading}
                    color="primary"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isPrivileged && (
                <Tooltip title={t("TacticBoardProfile:deleteTacticBoard")}>
                  <IconButton
                    onClick={onDeleteTacticBoardClick}
                    color="error"
                    disabled={
                      !tacticBoard ||
                      isDeleteTacticBoardLoading ||
                      isUpdateTacticBoardMetaLoading
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </SoftBox>
          </>
        }
        bottomNavigation={
          !isUpMd && [
            isPrivileged && (
              <Tooltip
                key="edit"
                title={t("TacticBoardProfile:editTacticBoardMeta")}
              >
                <BottomNavigationAction
                  icon={isEditMode ? <SaveIcon /> : <EditIcon />}
                  onClick={() => {
                    setIsEditMode(!isEditMode);

                    if (isEditMode && formik.isValid) {
                      formik.submitForm().then(() => {});
                    }
                  }}
                />
              </Tooltip>
            ),
            (userId && userId !== "" && tacticBoardId) || isPrivileged ? (
              <Tooltip key="more" title={t("TacticBoardProfile:moreActions")}>
                <BottomNavigationAction
                  icon={<MoreVertIcon />}
                  onClick={handleMenuOpen}
                />
              </Tooltip>
            ) : null,
          ]
        }
      >
        {() => (
          <>
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
              <TacticBoardInProfileWrapper tacticBoardId={tacticBoardId} />
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
                                {formik.values.tags?.length == 0 && "No Tags"}
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
              {isEditMode && isCreator && (
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
                                disabled={isDeleteTacticboardAccessLoading}
                                onClick={() => {
                                  if (tacticBoardId) {
                                    deleteTacticboardAccess({
                                      tacticboardId: tacticBoardId,
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

            {/* Mobile Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {userId && userId !== "" && tacticBoardId && (
                <MenuItem
                  onClick={() => {
                    if (isFavorite) {
                      removeFavoriteTacticboard({
                        tacticboardId: tacticBoardId,
                        userId: userId,
                      });
                    } else {
                      addFavoriteTacticboard({
                        tacticboardId: tacticBoardId,
                        userId: userId,
                      });
                    }
                    handleMenuClose();
                  }}
                  disabled={
                    isAddFavoriteTacticboardLoading ||
                    isRemoveFavoriteTacticboardLoading
                  }
                >
                  <FavoriteIcon
                    color={isFavorite ? "error" : "inherit"}
                    sx={{ mr: 1 }}
                  />
                  {t("TacticBoardProfile:favoriteTacticBoard")}
                </MenuItem>
              )}
              {userId && userId !== "" && tacticBoardId && (
                <MenuItem
                  onClick={handleDuplicateClick}
                  disabled={isDuplicateTacticBoardLoading}
                >
                  <ContentCopyIcon sx={{ mr: 1 }} />
                  {t("TacticBoardProfile:duplicateTacticBoard")}
                </MenuItem>
              )}
              {isPrivileged && (
                <MenuItem
                  onClick={() => {
                    onDeleteTacticBoardClick();
                    handleMenuClose();
                  }}
                  disabled={
                    !tacticBoard ||
                    isDeleteTacticBoardLoading ||
                    isUpdateTacticBoardMetaLoading
                  }
                >
                  <DeleteIcon color="error" sx={{ mr: 1 }} />
                  {t("TacticBoardProfile:deleteTacticBoard")}
                </MenuItem>
              )}
            </Menu>

            {/* Duplicate Dialog */}
            <Dialog
              open={openDuplicateDialog}
              onClose={handleDuplicateCancel}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {t("TacticBoardProfile:duplicateDialog.title")}
              </DialogTitle>
              <DialogContent>
                {isDuplicateTacticBoardError && (
                  <Alert color="error" sx={{ mb: 2 }}>
                    {t("TacticBoardProfile:duplicateDialog.errorDuplicating")}
                  </Alert>
                )}
                <TextField
                  autoFocus
                  margin="dense"
                  label={t("TacticBoardProfile:duplicateDialog.nameLabel")}
                  placeholder={t(
                    "TacticBoardProfile:duplicateDialog.namePlaceholder",
                  )}
                  type="text"
                  fullWidth
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && duplicateName.trim()) {
                      handleDuplicateConfirm();
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDuplicateCancel} color="secondary">
                  {t("TacticBoardProfile:duplicateDialog.cancel")}
                </Button>
                <Button
                  onClick={handleDuplicateConfirm}
                  color="primary"
                  variant="contained"
                  disabled={
                    !duplicateName.trim() || isDuplicateTacticBoardLoading
                  }
                >
                  {t("TacticBoardProfile:duplicateDialog.duplicate")}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </ProfileLayout>
    </FormikProvider>
  );
};

export default TacticBoardProfile;
