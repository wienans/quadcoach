import "./translations";
import { Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerifyEmailMutation } from "../authApi";

import { DashboardLayout } from "../../components/LayoutContainers";
import Footer from "../../components/Footer";

const VerifyEmail = (): JSX.Element => {
  const { t } = useTranslation("VerifyEmail");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailToken = searchParams.get("emailToken");

  const [
    verifyEmail,
    {
      isSuccess: isVerifySuccess,
      isLoading: isVerifyLoading,
      isError: isVerifyError,
      error,
    },
  ] = useVerifyEmailMutation();

  useEffect(() => {
    if (emailToken) {
      verifyEmail({ emailToken }).then((result) => {
        if ("data" in result && result.data) {
          navigate("/login");
        }
      });
    }
  }, [emailToken, verifyEmail, navigate]);

  return (
    <DashboardLayout>
      {() => (
        <>
          {!isVerifyError && !isVerifyLoading && !isVerifySuccess && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("VerifyEmail:NoTokenFound")}
            </Alert>
          )}
          {/* @ts-ignore */}
          {isVerifyError && error?.status === 404 && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("VerifyEmail:errorVerifyingEmail")}
            </Alert>
          )}
          {isVerifyLoading && (
            <Alert color="info" sx={{ mt: 2 }}>
              {t("VerifyEmail:waitingToVerifyEmail")}
            </Alert>
          )}
          {isVerifySuccess && (
            <Alert color="info" sx={{ mt: 2 }}>
              {t("VerifyEmail:redirectingToLogin")}
            </Alert>
          )}
          <Footer />
        </>
      )}
    </DashboardLayout>
  );
};

export default VerifyEmail;
