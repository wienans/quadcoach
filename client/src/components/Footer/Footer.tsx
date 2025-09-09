import { Collapse, Icon, Link } from "@mui/material";
import SoftBox from "../SoftBox";
import SoftTypography from "../SoftTypography";
import { useFooter } from "./useFooter";
import { useTranslation } from "react-i18next";
import "./translations";

const Footer = (): JSX.Element => {
  const { isFooterOpen, toggleFooter } = useFooter();
  const { t } = useTranslation("Footer");
  return (
    <>
      <SoftBox
        width="100%"
        display="flex"
        flexDirection={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems="center"
        px={1.5}
        mt={3}
      >
        <SoftBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          color="text"
          fontSize="small" //{size.sm}
          px={1.5}
        >
          &copy; {new Date().getFullYear()}, made with
          <SoftBox fontSize="small" color="text" mb={-0.5} mx={0.25}>
            <Icon color="inherit" fontSize="inherit">
              favorite
            </Icon>
          </SoftBox>
          by
          <SoftTypography variant="button" fontSize="small" fontWeight="medium">
            &nbsp;Quadcaoch&nbsp;
          </SoftTypography>
        </SoftBox>
        <SoftBox
          component="ul"
          sx={({ breakpoints }) => ({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            listStyle: "none",
            mt: 3,
            mb: 0,
            p: 0,

            [breakpoints.up("lg")]: {
              mt: 0,
            },
          })}
        >
          <SoftBox key={"Impressum"} component="li" px={2} lineHeight={1}>
            <Link href={""}>
              <SoftTypography
                variant="button"
                fontSize="small"
                fontWeight="regular"
                color="text"
                onClick={toggleFooter}
              >
                Impressum
              </SoftTypography>
            </Link>
          </SoftBox>
        </SoftBox>
      </SoftBox>
      <Collapse in={isFooterOpen} timeout="auto" unmountOnExit>
        <SoftBox id="footer-content" width="100%" px={3.0}>
          <SoftTypography fontSize="small">
            <br />
            {import.meta.env.VITE_NAME || ""} <br />
            {import.meta.env.VITE_ADDRESS_L1 || ""} <br />
            {import.meta.env.VITE_ADDRESS_L2 || ""} <br />
            E-Mail: {import.meta.env.VITE_EMAIL || ""} <br />
            Telefon: {import.meta.env.VITE_TELEFON || ""} <br /> <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            {t("Footer:t0")}
          </SoftTypography>
          <SoftTypography fontSize="small">
            <br />
            {t("Footer:t1")}
            <br />
            {t("Footer:b1")}
            <br />
            <br />
            {t("Footer:t2")}
            <br />
            {t("Footer:b2")}
            <br />
            <br />
            {t("Footer:t3")}
            <br />
            {t("Footer:b3")}
            <br />
            <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            {t("Footer:t4")}
          </SoftTypography>
          <SoftTypography fontSize="small">
            {import.meta.env.VITE_NAME} <br />
            {import.meta.env.VITE_ADDRESS_L1} <br />
            {import.meta.env.VITE_ADDRESS_L2} <br />
            E-Mail: {import.meta.env.VITE_EMAIL} <br />
            <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            {t("Footer:t5")}
          </SoftTypography>
          <SoftTypography fontSize="small">
            {t("Footer:b5")}
            <br />
            <br />
          </SoftTypography>
        </SoftBox>
      </Collapse>
    </>
  );
};

export default Footer;
