import "./translations";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  BottomNavigationAction,
  Card,
  CardHeader,
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
import AddTagDialog from "./AddTagDialog";
import Footer from "../../components/Footer";
import { useGetUserQuery, useUpdateUserMutation } from "../userApi";
import { User, UserPartialId } from "../../api/quadcoachApi/domain";

const MarkdownRenderer = lazy(
  () => import("../../components/MarkdownRenderer"),
);

const UserProfile = () => {
  const { t } = useTranslation("TacticBoardProfile");
  const { id: userViewId } = useParams();
  const { id: userId, roles: userRoles } = useAuth();
  const navigate = useNavigate();
  const {
    data: user,
    isError: isUserError,
    isLoading: isUserLoading,
  } = useGetUserQuery(userId);
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    if (
      user?._id === userId ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    }
  }, [user, userId, userRoles]);

  const [updateUser, { isLoading: isUpdateUserLoading }] =
    useUpdateUserMutation();

  const formik = useFormik<UserPartialId>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,
    validateOnChange: false,
    initialValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      active: user?.active ?? false,
      roles: user?.roles ?? ["user"],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("UserProfile:info.name.missing"),
      email: Yup.string()
        .email("UserProfile:info.email.valid")
        .required("UserProfile:info.email.missing"),
    }),

    onSubmit: (values) => {
      if (isPrivileged) {
        if (userId) {
          const { name, email, roles, active } = values;
          updateUser({
            _id: userId,
            name,
            email,
            roles,
            active,
          });
        }
      }
    },
  });

  const translateError = (
    errorResourceKey: string | undefined,
  ): string | undefined => (errorResourceKey ? t(errorResourceKey) : undefined);

  if (isUserLoading) {
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

  if (!user || isUserError) {
    return (
      <DashboardLayout>
        {() => (
          <>
            <Alert color="error">{t("UserProfile:errorLoadingUser")}</Alert>
          </>
        )}
      </DashboardLayout>
    );
  }

  return (
    <FormikProvider value={formik}>
      <ProfileLayout
        title={user?.name}
        //headerBackgroundImage={headerBackgroundImage}
        isDataLoading={isUserLoading}
        showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
        headerAction={
          <>
            {isPrivileged && (
              <SoftBox display="flex">
                <Tooltip title={t("UserProfile:editUser")}>
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
              </SoftBox>
            )}
          </>
        }
        bottomNavigation={
          !isUpMd && [
            isPrivileged && (
              <Tooltip key="edit" title={t("UserProfile:editUser")}>
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
            <Card sx={{ height: "100%" }}>
              {isEditMode && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:info.title")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid item xs={12} p={1}>
                      <FormGroup>
                        <SoftTypography variant="body2">
                          {t("UserProfile:info.name.label")}
                        </SoftTypography>
                        <SoftInput
                          error={
                            formik.touched.name && Boolean(formik.errors.name)
                          }
                          name="name"
                          required
                          id="outlined-basic"
                          placeholder={t("UserProfile:info.name.placeholder")}
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
                        <SoftTypography variant="body2">
                          {t("UserProfile:info.email.label")}
                        </SoftTypography>
                        <SoftInput
                          error={
                            formik.touched.email && Boolean(formik.errors.email)
                          }
                          name="email"
                          required
                          id="outlined-basic"
                          placeholder={t("UserProfile:info.email.placeholder")}
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          fullWidth
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.email &&
                          Boolean(formik.errors.email) && (
                            <FormHelperText error>
                              {translateError(formik.errors.email)}
                            </FormHelperText>
                          )}
                      </FormGroup>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(user?.roles) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:favoritList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    {user?.roles ?? ""}
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

export default UserProfile;
