import "./translations";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Alert,
  Grid,
  Skeleton,
  Chip,
  FormGroup,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CardHeader,
  Card,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  useUpdateTacticBoardMutation,
  useGetTacticBoardQuery,
  useDeleteTacticBoardMutation,
} from "../../api/quadcoachApi/tacticboardApi";
import { TacticBoardPartialId } from "../../api/quadcoachApi/domain";
import {
  SoftTypography,
  SoftBox,
  SoftButton,
  SoftInput,
} from "../../components";
import {
  FieldArray,
  FieldArrayRenderProps,
  FormikProvider,
  useFormik,
} from "formik";
import * as Yup from "yup";
import AddTagDialog from "./AddTagDialog";
import { cloneDeep } from "lodash";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";

const UpdateTacticBoardMeta = (): JSX.Element => {
  const { t } = useTranslation("UpdateTacticBoardMeta");
  const navigate = useNavigate();
  const { id: tacticBoardId } = useParams();

  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [isPriviliged, setIsPrivileged] = useState<boolean>(false);

  const {
    name: userName,
    id: userId,
    status: userStatus,
    roles: userRoles,
  } = useAuth();

  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const [
    updateTacticBoard,
    {
      isError: isUpdateTacticBoardError,
      isLoading: isUpdateTacticBoardLoading,
      isSuccess: isUpdateTacticBoardSuccess,
    },
  ] = useUpdateTacticBoardMutation();

  const [
    deleteTacticBoard,
    {
      isError: isDeleteTacticBoardError,
      isLoading: isDeleteTacticBoardLoading,
      isSuccess: isDeleteTacticBoardSuccess,
    },
  ] = useDeleteTacticBoardMutation();

  const formik = useFormik<TacticBoardPartialId>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: tacticBoard?.name ?? "",
      pages: tacticBoard?.pages ?? [],
      isPrivate: tacticBoard?.isPrivate ?? false,
      tags: tacticBoard?.tags ?? [],
      creator: tacticBoard?.creator ?? "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("UpdateTacticBoardMeta:info.name.missing"),
      tags: Yup.array().of(Yup.string()),
      isPrivate: Yup.boolean(),
    }),

    onSubmit: (values) => {
      if (tacticBoardId) {
        const { name, isPrivate, tags, pages } = values;
        const updatedTacticBoard: TacticBoardPartialId = {
          name,
          isPrivate,
          pages,
          tags,
        };
        updateTacticBoard({
          _id: tacticBoardId,
          ...updatedTacticBoard,
        });
      }
    },
  });

  const onDeleteExerciseClick = () => {
    if (!tacticBoard) return;
    deleteTacticBoard(tacticBoard._id);
    navigate("/tacticboards");
  };

  const translateError = (
    errorResourceKey: string | undefined,
  ): string | undefined => (errorResourceKey ? t(errorResourceKey) : undefined);

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

  useEffect(() => {
    if (
      userId == tacticBoard?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    }
  }, [userId, tacticBoard, userRoles]);

  return (
    <FormikProvider value={formik}>
      <DashboardLayout
        header={(scrollTrigger) => (
          <Card
            sx={(theme) => ({
              position: "sticky",
              top: theme.spacing(1),
              zIndex: 1,
              ...(scrollTrigger
                ? {
                    backgroundColor: theme.palette.transparent.main,
                    boxShadow: theme.boxShadows.navbarBoxShadow,
                    backdropFilter: `saturate(200%) blur(${theme.functions.pxToRem(
                      30,
                    )})`,
                  }
                : {
                    backgroundColor: theme.functions.rgba(
                      theme.palette.white.main,
                      0.8,
                    ),
                    boxShadow: "none",
                    backdropFilter: "none",
                  }),
              transition: theme.transitions.create("all", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
            })}
          >
            <CardHeader
              title={
                <SoftTypography variant="h3">
                  {t("UpdateTacticBoardMeta:title")}
                </SoftTypography>
              }
            />
          </Card>
        )}
      >
        {() => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              formik.handleSubmit();
              return false;
            }}
          >
            <Grid container spacing={2}>
              {isTacticBoardError && (
                <Grid item xs={12} justifyContent="center" display="flex">
                  <Alert color="error">{"Error Loading"}</Alert>
                </Grid>
              )}
              {!isPriviliged &&
                !isTacticBoardLoading &&
                !isTacticBoardError && (
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <Alert color="error">{"Not Authorized"}</Alert>
                  </Grid>
                )}
              {isTacticBoardLoading && (
                <>
                  <Grid item xs={12}>
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={120}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={120}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Skeleton
                      variant="rectangular"
                      width={"100%"}
                      height={120}
                    />
                  </Grid>
                </>
              )}
              {!isTacticBoardError && !isTacticBoardLoading && isPriviliged && (
                <>
                  <Grid item xs={12}>
                    <SoftBox
                      variant="contained"
                      shadow="lg"
                      opacity={1}
                      p={1}
                      my={2}
                      borderRadius="lg"
                    >
                      <SoftTypography
                        variant="h5"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        {t("UpdateTacticBoardMeta:info.title")}
                      </SoftTypography>
                      <Grid item xs={12} p={1}>
                        <FormGroup>
                          <SoftTypography variant="body2">
                            {t("UpdateTacticBoardMeta:info.name.label")}
                          </SoftTypography>
                          <SoftInput
                            error={
                              formik.touched.name && Boolean(formik.errors.name)
                            }
                            name="name"
                            required
                            id="outlined-basic"
                            placeholder={t(
                              "UpdateTacticBoardMeta:info.name.placeholder",
                            )}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            fullWidth
                            onBlur={formik.handleBlur}
                          />
                          {formik.touched.name &&
                            Boolean(formik.errors.name) && (
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
                                {t(
                                  "UpdateTacticBoardMeta:info.isPrivate.label",
                                )}
                              </SoftTypography>
                            }
                          />
                        </FormGroup>
                      </Grid>
                      <Grid item xs={12} p={1}>
                        <SoftTypography variant="body2">
                          {t(
                            "UpdateTacticBoardMeta:info.backgroundImage.label",
                          )}
                        </SoftTypography>
                        <Select
                          labelId="court-select-label"
                          id="court-select"
                          value={
                            formik.values.pages[0]
                              ? formik.values.pages[0]?.backgroundImage.src
                              : ""
                          }
                          label={t(
                            "UpdateTacticBoardMeta:info.backgroundImage.label",
                          )}
                          onChange={(event: SelectChangeEvent) => {
                            const updatedPages = cloneDeep(formik.values.pages);
                            updatedPages.forEach((page) => {
                              page.backgroundImage.src = event.target.value;
                            });
                            formik.setValues({
                              ...formik.values,
                              pages: updatedPages,
                            });
                          }}
                        >
                          <MenuItem value={"/full-court.svg"}>
                            Full Court
                          </MenuItem>
                          <MenuItem value={"/half-court.svg"}>
                            Half Court
                          </MenuItem>
                          <MenuItem value={"/empty-court.svg"}>
                            Empty Court
                          </MenuItem>
                        </Select>
                      </Grid>
                      <Grid item xs={12} p={1}>
                        <FormGroup>
                          <SoftTypography variant="body2">
                            {t("UpdateTacticBoardMeta:info.tags.label")}
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
                    </SoftBox>
                  </Grid>
                  <Grid item xs={12}>
                    <SoftBox
                      variant="contained"
                      shadow="lg"
                      opacity={1}
                      p={1}
                      my={2}
                      borderRadius="lg"
                    >
                      <SoftTypography
                        variant="h5"
                        fontWeight="bold"
                        textTransform="uppercase"
                      >
                        {t("UpdateTacticBoardMeta:board.title")}
                      </SoftTypography>
                      <Grid item xs={12} p={1}>
                        {formik.values.pages[0] ? (
                          <img
                            src={formik.values.pages[0].backgroundImage.src}
                            width={"100%"}
                          />
                        ) : (
                          <></>
                        )}
                      </Grid>
                      <Grid item xs={12} p={1}>
                        <SoftButton
                          onClick={() => {
                            if (formik.isValid) {
                              formik.submitForm().then(() => {
                                navigate(
                                  `/tacticboards/${tacticBoardId}/updateBoard`,
                                );
                              });
                            }
                          }}
                          sx={{ marginRight: 1 }}
                          type="button"
                        >
                          {t("UpdateTacticBoardMeta:editBoardBtn")}
                        </SoftButton>
                      </Grid>
                    </SoftBox>
                  </Grid>
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftButton
                      color="primary"
                      sx={{ marginRight: 1 }}
                      type="button"
                      onClick={() => {
                        if (formik.isValid) {
                          formik.submitForm().then(() => {
                            navigate(`/tacticboards`);
                          });
                        }
                      }}
                      disabled={
                        isUpdateTacticBoardLoading || isTacticBoardLoading
                      }
                    >
                      {t("UpdateTacticBoardMeta:updateBoardBtn")}
                    </SoftButton>
                    <SoftButton
                      onClick={onDeleteExerciseClick}
                      color="error"
                      type="button"
                      disabled={isDeleteTacticBoardLoading}
                    >
                      {t("UpdateTacticBoardMeta:deleteBoardBtn")}
                    </SoftButton>
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        )}
      </DashboardLayout>
    </FormikProvider>
  );
};

export default UpdateTacticBoardMeta;
