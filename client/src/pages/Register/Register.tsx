import "./translations";
import { Card, FormGroup, Grid, FormHelperText, Alert } from "@mui/material";
import {
  SoftBox,
  SoftButton,
  SoftInput,
  SoftTypography,
} from "../../components";
import { useTranslation } from "react-i18next";

import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../authApi";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { DashboardLayout } from "../../components/LayoutContainers";
import Footer from "../../components/Footer";

type RegisterFields = {
  name: string;
  email: string;
  password: string;
  confirmpassword: string;
};

const Register = (): JSX.Element => {
  const { t } = useTranslation("Register");
  const navigate = useNavigate();

  const [register, { isLoading: isRegisterLoading, isError: isRegisterError }] =
    useRegisterMutation();

  const formik = useFormik<RegisterFields>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmpassword: "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Register:info.name.missing"),
      email: Yup.string()
        .email("Register:info.email.valid")
        .required("Register:info.email.missing"),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          "Register:info.password.valid",
        )
        .required("Register:info.password.missing"),
      confirmpassword: Yup.string().oneOf(
        [Yup.ref("password")],
        "Register:info.confirmpassword.missing",
      ),
    }),

    onSubmit: async (values) => {
      const { name, email, password } = values;

      const result = await register({
        name: name,
        email: email,
        password: password,
      });
      // @ts-ignore
      if (result.data) {
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
                <SoftTypography variant="h3">
                  {t("Register:title")}
                </SoftTypography>
              </SoftBox>
              <Grid item xs={12}>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("Register:info.name.label")}
                    </SoftTypography>
                    <SoftInput
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      name="name"
                      required
                      id="outlined-basic"
                      placeholder={t("Register:info.name.placeholder")}
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
                      {t("Register:info.email.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      name="email"
                      required
                      id="outlined-basic"
                      placeholder={t("Register:info.email.placeholder")}
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
                      {t("Register:info.password.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
                      }
                      name="password"
                      required
                      id="outlined-basic"
                      type="password"
                      placeholder={t("Register:info.password.placeholder")}
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
                </Grid>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("Register:info.confirmpassword.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.confirmpassword &&
                        Boolean(formik.errors.confirmpassword)
                      }
                      name="confirmpassword"
                      required
                      id="outlined-basic"
                      type="password"
                      placeholder={t(
                        "Register:info.confirmpassword.placeholder",
                      )}
                      value={formik.values.confirmpassword}
                      onChange={formik.handleChange}
                      fullWidth
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.confirmpassword &&
                      Boolean(formik.errors.confirmpassword) && (
                        <FormHelperText error>
                          {translateError(formik.errors.confirmpassword)}
                        </FormHelperText>
                      )}
                  </FormGroup>
                </Grid>
                {isRegisterError && (
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <Alert color="error" sx={{ mt: 2 }}>
                      {" "}
                      {t("Register:registerErr")}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} p={1}>
                  <SoftButton
                    sx={{ marginRight: 1 }}
                    type="submit"
                    color="primary"
                    disabled={isRegisterLoading}
                  >
                    {t("Register:registerBtn")}
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

export default Register;
