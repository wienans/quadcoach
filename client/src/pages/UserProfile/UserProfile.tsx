import "./translations";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  BottomNavigationAction,
  Card,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  ListItemText,
  List,
  Skeleton,
  Theme,
  Tooltip,
  useMediaQuery,
  ListItemButton,
} from "@mui/material";
import * as Yup from "yup";
import {
  SoftBox,
  SoftButton,
  SoftInput,
  SoftTypography,
} from "../../components";

import { useParams, useNavigate } from "react-router-dom";
import {
  DashboardLayout,
  ProfileLayout,
} from "../../components/LayoutContainers";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useAuth } from "../../store/hooks";
import { FormikProvider, useFormik } from "formik";
import Footer from "../../components/Footer";
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
  useGetOnlineUsersCountQuery,
  useGetUserExercisesQuery,
  useGetUserTacticboardsQuery,
} from "../userApi";
import { UserPartialId } from "../../api/quadcoachApi/domain";
import {
  useGetFavoriteExercisesHeadersQuery,
  useGetFavoriteTacticboardsHeadersQuery,
} from "../../api/quadcoachApi/favoriteApi";
import { useSendLogoutMutation } from "../authApi";

const UserProfile = () => {
  const { t } = useTranslation("UserProfile");
  const { id: userViewId } = useParams();
  const { id: userId, roles: userRoles } = useAuth();
  const [deleteUser] = useDeleteUserMutation();
  const [sendLogout] = useSendLogoutMutation();
  const navigate = useNavigate();
  const {
    data: user,
    isError: isUserError,
    isLoading: isUserLoading,
  } = useGetUserQuery(userViewId ?? "");
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
  const { data: favoriteExercises } = useGetFavoriteExercisesHeadersQuery({
    userId: userViewId ?? "",
  });
  const { data: favoriteTacticBoards } = useGetFavoriteTacticboardsHeadersQuery(
    {
      userId: userViewId ?? "",
    },
  );

  // Check if current logged-in user is admin (not the user being viewed)
  const isCurrentUserAdmin =
    userRoles.includes("Admin") || userRoles.includes("admin");

  // Only fetch online users count if current user is admin
  const { data: onlineUsersData } = useGetOnlineUsersCountQuery(undefined, {
    skip: !isCurrentUserAdmin,
  });

  // Fetch user's owned and accessible exercises and tacticboards
  const { data: userExercises } = useGetUserExercisesQuery(userViewId ?? "", {
    skip: !userViewId,
  });
  const { data: userTacticboards } = useGetUserTacticboardsQuery(
    userViewId ?? "",
    {
      skip: !userViewId,
    },
  );

  const handleDeleteAccount = async () => {
    try {
      if (
        userViewId &&
        window.confirm(
          "Are you sure you want to delete your account? This action cannot be undone.",
        )
      ) {
        deleteUser(userViewId).unwrap();
        sendLogout({}).unwrap();
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

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
        if (userViewId) {
          const { name, email, roles, active } = values;
          updateUser({
            _id: userViewId,
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
                    disabled={isUpdateUserLoading}
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
              {isCurrentUserAdmin && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:adminInfo")}
                  </AccordionSummary>
                  <AccordionDetails>
                    <SoftBox p={1}>
                      <SoftTypography variant="body1" fontWeight="medium">
                        {t("UserProfile:onlineUsers")}:{" "}
                        {onlineUsersData?.onlineUsersCount ?? 0}
                      </SoftTypography>
                      <SoftTypography
                        variant="body2"
                        color="text"
                        sx={{ mt: 0.5 }}
                      >
                        {t("UserProfile:onlineUsersDescription")}
                      </SoftTypography>
                    </SoftBox>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(favoriteExercises) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:favoriteExercisesList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {favoriteExercises?.map((exercise) => (
                        <ListItemButton
                          key={exercise._id}
                          href={`/exercises/${exercise._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={exercise.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(favoriteTacticBoards) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:favoriteTacticboardsList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {favoriteTacticBoards?.map((tacticBoard) => (
                        <ListItemButton
                          key={tacticBoard._id}
                          href={`/tacticboards/${tacticBoard._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={tacticBoard.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(userExercises?.owned?.length) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:ownedExercisesList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {userExercises?.owned?.map((exercise) => (
                        <ListItemButton
                          key={exercise._id}
                          href={`/exercises/${exercise._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={exercise.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(userExercises?.accessible?.length) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:accessibleExercisesList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {userExercises?.accessible?.map((exercise) => (
                        <ListItemButton
                          key={exercise._id}
                          href={`/exercises/${exercise._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={exercise.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(userTacticboards?.owned?.length) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:ownedTacticboardsList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {userTacticboards?.owned?.map((tacticBoard) => (
                        <ListItemButton
                          key={tacticBoard._id}
                          href={`/tacticboards/${tacticBoard._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={tacticBoard.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {Boolean(userTacticboards?.accessible?.length) && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {t("UserProfile:accessibleTacticboardsList")}
                  </AccordionSummary>
                  <AccordionDetails sx={{ ml: 1 }}>
                    <List>
                      {userTacticboards?.accessible?.map((tacticBoard) => (
                        <ListItemButton
                          key={tacticBoard._id}
                          href={`/tacticboards/${tacticBoard._id}`}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={tacticBoard.name}
                            sx={{
                              "& .MuiTypography-root": {
                                fontSize: "1rem",
                                fontWeight: 400,
                              },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
              {isEditMode && (
                <SoftBox
                  sx={{
                    mt: 2,
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <SoftButton
                    variant="contained"
                    color="error"
                    onClick={handleDeleteAccount}
                  >
                    {t("UserProfile:deleteAccount")}
                  </SoftButton>
                </SoftBox>
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
