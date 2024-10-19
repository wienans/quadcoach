import "./translations";
import {
  Card,
  FormGroup,
  Grid,
  FormHelperText,
  Alert,
  Link,
} from "@mui/material";
import {
  SoftBox,
  SoftButton,
  SoftInput,
  SoftTypography,
} from "../../components";
import { useTranslation } from "react-i18next";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../api/auth/authSlice";
import { useLoginMutation } from "../authApi";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { DashboardLayout } from "../../components/LayoutContainers";
import Footer from "../../components/Footer";

type LoginFields = {
  email: string;
  password: string;
};

const Login = (): JSX.Element => {
  const { t } = useTranslation("Login");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading: isLoginLoading, isError: isLoginError }] =
    useLoginMutation();

  const formik = useFormik<LoginFields>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: Yup.object({
      email: Yup.string().required("Login:info.email.missing"),
      password: Yup.string().required("Login:info.password.missing"),
    }),

    onSubmit: async (values) => {
      const { email, password } = values;

      const result = await login({
        email: email,
        password: password,
      });
      // @ts-ignore
      if (result.data) {
        // @ts-ignore
        dispatch(setCredentials({ accessToken: result.data.accessToken }));
        navigate("/");
      }
    },
  });

  const translateError = (
    errorResourceKey: string | undefined,
  ): string | undefined => (errorResourceKey ? t(errorResourceKey) : undefined);

  return (
    <FormikProvider value={formik}>
      <DashboardLayout>
        {() => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              formik.handleSubmit();
              return false;
            }}
          >
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <SoftBox sx={{ m: 2, p: 2 }}>
                <SoftTypography variant="h3">{t("Login:title")}</SoftTypography>
              </SoftBox>
              <Grid item xs={12}>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("Login:info.email.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      name="email"
                      required
                      id="outlined-basic"
                      placeholder={t("Login:info.email.placeholder")}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      fullWidth
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && Boolean(formik.errors.email) && (
                      <FormHelperText error>
                        {translateError(formik.errors.email)}
                      </FormHelperText>
                    )}
                  </FormGroup>
                </Grid>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("Login:info.password.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      name="password"
                      required
                      id="outlined-basic"
                      type="password"
                      placeholder={t("Login:info.password.placeholder")}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      fullWidth
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.password &&
                      Boolean(formik.errors.password) && (
                        <FormHelperText error>
                          {translateError(formik.errors.password)}
                        </FormHelperText>
                      )}
                  </FormGroup>
                  <Link href="/resetPassword">
                    <SoftTypography variant="body2">
                      {t("Login:forgotPassword")}
                    </SoftTypography>
                  </Link>
                </Grid>
                {isLoginError && (
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <Alert color="error" sx={{ mt: 2 }}>
                      {" "}
                      {t("Login:loginErr")}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} p={1}>
                  <SoftButton
                    sx={{ marginRight: 1 }}
                    type="submit"
                    color="primary"
                    disabled={isLoginLoading}
                  >
                    {t("Login:loginBtn")}
                  </SoftButton>
                  <SoftButton
                    sx={{ marginRight: 1 }}
                    type="button"
                    color="secondary"
                    disabled={isLoginLoading}
                    onClick={() => navigate("/register")}
                  >
                    {t("Login:registerBtn")}
                  </SoftButton>
                </Grid>
              </Grid>
            </Card>
            <Footer />
          </form>
        )}
      </DashboardLayout>
    </FormikProvider>
  );
};

export default Login;
