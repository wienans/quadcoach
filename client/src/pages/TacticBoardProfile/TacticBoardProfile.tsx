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
  FormHelperText,
  Grid,
  IconButton,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import * as Yup from "yup";
import { SoftBox, SoftInput, SoftTypography } from "../../components";
import {
  useDeleteTacticBoardMutation,
  useGetTacticBoardQuery,
  useUpdateTacticBoardMetaMutation,
} from "../../api/quadcoachApi/tacticboardApi";
import { useParams, useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAuth } from "../../store/hooks";
import TacticBoardInProfileWrapper from "./TacticBoardInProfile";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

const TacticBoardProfile = () => {
  const { t } = useTranslation("TacticBoardProfile");
  const { id: tacticBoardId } = useParams();

  const navigate = useNavigate();
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const { id: userId, roles: userRoles } = useAuth();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const [updateTacticBoardMeta, { isLoading: isUpdateTacticBoardMetaLoading }] =
    useUpdateTacticBoardMetaMutation();
  const [
    deleteTacticBoard,
    {
      isError: isDeleteTacticBoardError,
      isLoading: isDeleteTacticBoardLoading,
      isSuccess: isDeleteTacticBoardSuccess,
      error: deleteError,
    },
  ] = useDeleteTacticBoardMutation();

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
    }
  }, [tacticBoard, userId, userRoles]);

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

  const translateError = (
    errorResourceKey: string | undefined,
  ): string | undefined => (errorResourceKey ? t(errorResourceKey) : undefined);

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
        title={tacticBoard?.name}
        //headerBackgroundImage={headerBackgroundImage}
        isDataLoading={isTacticBoardLoading}
        showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
        headerAction={
          <>
            {isPrivileged && (
              <SoftBox display="flex">
                <Tooltip title={t("TacticBoardProfile:editTacticBoardMeta")}>
                  <IconButton
                    onClick={() => {
                      setIsEditMode(!isEditMode);

                      if (isEditMode && formik.isValid) {
                        formik.submitForm().then(() => {});
                      }
                    }}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    {isEditMode ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
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
              </SoftBox>
            )}
          </>
        }
        bottomNavigation={
          !isUpMd && (
            <>
              <Tooltip title={t("TacticBoardProfile:TacticBoardProfile")}>
                <BottomNavigationAction
                  icon={<EditIcon />}
                  onClick={() => {
                    setIsEditMode(!isEditMode);
                  }}
                />
              </Tooltip>
              <Tooltip title={t("TacticBoardProfile:deleteTacticBoard")}>
                <BottomNavigationAction
                  icon={<DeleteIcon />}
                  onClick={onDeleteTacticBoardClick}
                  disabled={
                    !tacticBoard ||
                    isDeleteTacticBoardLoading ||
                    isUpdateTacticBoardMetaLoading
                  }
                />
              </Tooltip>
            </>
          )
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
                        <SoftTypography variant="body2">
                          {t("TacticBoardProfile:info.name.label")}
                        </SoftTypography>
                        <SoftInput
                          error={
                            formik.touched.name && Boolean(formik.errors.name)
                          }
                          name="name"
                          required
                          id="outlined-basic"
                          placeholder={t(
                            "TacticBoardProfile:info.name.placeholder",
                          )}
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          fullWidth
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && Boolean(formik.errors.name) && (
                          <FormHelperText error>
                            {translateError(formik.errors.name)}
                          </FormHelperText>
                        )}
                      </FormGroup>
                    </Grid>
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
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {tacticBoard?.description}
                    </Markdown>
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
                    <Markdown remarkPlugins={[remarkGfm]}>
                      {tacticBoard?.coaching_points}
                    </Markdown>
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
            </Card>
            <Footer />
          </>
        )}
      </ProfileLayout>
    </FormikProvider>
  );
};

export default TacticBoardProfile;
