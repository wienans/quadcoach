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
import { useResetPasswordMutation } from "../authApi";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { DashboardLayout } from "../../components/LayoutContainers";
import { useState } from "react";

type ResetPasswordFields = {
  email: string;
};

const ResetPassword = (): JSX.Element => {
  const { t } = useTranslation("ResetPassword");
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [resetPassword, { isLoading: isLoading, isError: isError }] =
    useResetPasswordMutation();

  const formik = useFormik<ResetPasswordFields>({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("ResetPassword:info.email.valid")
        .required("ResetPassword:info.email.missing"),
    }),

    onSubmit: async (values) => {
      const { email } = values;

      const result = await resetPassword({
        email: email,
      });
      if (result.data) {
        setIsSuccess(true);
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
                  {t("ResetPassword:title")}
                </SoftTypography>
              </SoftBox>
              <Grid item xs={12}>
                <Grid item xs={12} p={1}>
                  <FormGroup>
                    <SoftTypography variant="body2">
                      {t("ResetPassword:info.email.label")}
                    </SoftTypography>
                    <SoftInput
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      name="email"
                      required
                      id="outlined-basic"
                      placeholder={t("ResetPassword:info.email.placeholder")}
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
                {isError && (
                  <Grid item xs={12} justifyContent="center" display="flex">
                    <Alert color="error" sx={{ mt: 2 }}>
                      {" "}
                      {t("ResetPassword:registerErr")}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} p={1}>
                  {!isSuccess && (
                    <SoftButton
                      sx={{ marginRight: 1 }}
                      type="submit"
                      color="primary"
                      disabled={isLoading}
                    >
                      {t("ResetPassword:registerBtn")}
                    </SoftButton>
                  )}
                  {isSuccess && (
                    <SoftTypography variant="body2" sx={{ marginRight: 1 }}>
                      {t("ResetPassword:emailSend")}
                    </SoftTypography>
                  )}
                </Grid>
              </Grid>
            </Card>
          </form>
        )}
      </DashboardLayout>
    </FormikProvider>
  );
};

export default ResetPassword;
