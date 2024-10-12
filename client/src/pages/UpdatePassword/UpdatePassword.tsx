import "./translations";
import { Card, FormGroup, Grid, FormHelperText, Alert } from "@mui/material";
import {
  SoftBox,
  SoftButton,
  SoftInput,
  SoftTypography,
} from "../../components";
import { useTranslation } from "react-i18next";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useUpdatePasswordMutation } from "../authApi";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { DashboardLayout } from "../../components/LayoutContainers";

type UpdatePasswordFields = {
  password: string;
  confirmpassword: string;
};

const UpdatePassword = (): JSX.Element => {
  const { t } = useTranslation("UpdatePassword");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passwordToken = searchParams.get("passwordToken");
  const [updatePassword, { isLoading, isError }] = useUpdatePasswordMutation();

  const formik = useFormik<UpdatePasswordFields>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      password: "",
      confirmpassword: "",
    },

    validationSchema: Yup.object({
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
          "UpdatePassword:info.password.valid",
        )
        .required("UpdatePassword:info.password.missing"),
      confirmpassword: Yup.string().oneOf(
        [Yup.ref("password")],
        "UpdatePassword:info.confirmpassword.missing",
      ),
    }),

    onSubmit: async (values) => {
      const { password } = values;

      const result = await updatePassword({
        password: password,
        passwordResetToken: passwordToken,
      });
      // @ts-ignore
      if (result.data) {
        navigate("/login");
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
                  {t("UpdatePassword:title")}
                </SoftTypography>
              </SoftBox>
              <Grid item xs={12}>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("UpdatePassword:info.password.label")}
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
                      placeholder={t(
                        "UpdatePassword:info.password.placeholder",
                      )}
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
                      {t("UpdatePassword:info.confirmpassword.label")}
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
                        "UpdatePassword:info.confirmpassword.placeholder",
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
                {isError && (
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <Alert color="error" sx={{ mt: 2 }}>
                      {" "}
                      {t("UpdatePassword:registerErr")}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} p={1}>
                  <SoftButton
                    sx={{ marginRight: 1 }}
                    type="submit"
                    color="primary"
                    disabled={isLoading}
                  >
                    {t("UpdatePassword:registerBtn")}
                  </SoftButton>
                </Grid>
              </Grid>
            </Card>
          </form>
        )}
      </DashboardLayout>
    </FormikProvider>
  );
};

export default UpdatePassword;
