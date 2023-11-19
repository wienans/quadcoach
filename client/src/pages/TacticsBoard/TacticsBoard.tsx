import "./translations";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { useTranslation } from "react-i18next";
import { SoftTypography, SoftInput, SoftButton } from "../../components";
const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticsBoard");
  useUpdateBreadcrumbs(t("TacticsBoard:titel"));
  return (
    <p>
      <SoftTypography variant="h3">{t("TacticsBoard:titel")}</SoftTypography>
    </p>
  );
};

export default TacticsBoard;
