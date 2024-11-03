import { Collapse, Icon, Link } from "@mui/material";
import SoftBox from "../SoftBox";
import SoftTypography from "../SoftTypography";
import { useState } from "react";

const Footer = (): JSX.Element => {
  const [open, setOpen] = useState<boolean>(false);
  const toggle = () => {
    setOpen(!open);
  };

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
                onClick={toggle}
              >
                Impressum
              </SoftTypography>
            </Link>
          </SoftBox>
        </SoftBox>
      </SoftBox>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <SoftBox width="100%" px={3.0}>
          <SoftTypography fontSize="small">
            <br />
            {import.meta.env.VITE_NAME || process.env.VITE_NAME} <br />
            {import.meta.env.VITE_ADDRESS_L1 ||
              process.env.VITE_ADDRESS_L1}{" "}
            <br />
            {import.meta.env.VITE_ADDRESS_L2 ||
              process.env.VITE_ADDRESS_L2}{" "}
            <br />
            E-Mail: {import.meta.env.VITE_EMAIL || process.env.VITE_EMAIL}{" "}
            <br />
            Telefon: {import.meta.env.VITE_TELEFON ||
              process.env.VITE_TELEFON}{" "}
            <br /> <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            Disclaimer – rechtliche Hinweise
          </SoftTypography>
          <SoftTypography fontSize="small">
            <br />
            § 1 Warnhinweis zu Inhalten
            <br />
            Die kostenlosen und frei zugänglichen Inhalte dieser Webseite wurden
            mit größtmöglicher Sorgfalt erstellt. Der Anbieter dieser Webseite
            übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit
            und Aktualität der bereitgestellten kostenlosen und frei
            zugänglichen journalistischen Ratgeber und Nachrichten. Namentlich
            gekennzeichnete Beiträge geben die Meinung des jeweiligen Autors und
            nicht immer die Meinung des Anbieters wieder. Allein durch den
            Aufruf der kostenlosen und frei zugänglichen Inhalte kommt keinerlei
            Vertragsverhältnis zwischen dem Nutzer und dem Anbieter zustande,
            insoweit fehlt es am Rechtsbindungswillen des Anbieters.
            <br />
            <br />
            § 2 Externe Links
            <br />
            Diese Website enthält Verknüpfungen zu Websites Dritter ("externe
            Links"). Diese Websites unterliegen der Haftung der jeweiligen
            Betreiber. Der Anbieter hat bei der erstmaligen Verknüpfung der
            externen Links die fremden Inhalte daraufhin überprüft, ob etwaige
            Rechtsverstöße bestehen. Zu dem Zeitpunkt waren keine Rechtsverstöße
            ersichtlich. Der Anbieter hat keinerlei Einfluss auf die aktuelle
            und zukünftige Gestaltung und auf die Inhalte der verknüpften
            Seiten. Das Setzen von externen Links bedeutet nicht, dass sich der
            Anbieter die hinter dem Verweis oder Link liegenden Inhalte zu Eigen
            macht. Eine ständige Kontrolle der externen Links ist für den
            Anbieter ohne konkrete Hinweise auf Rechtsverstöße nicht zumutbar.
            Bei Kenntnis von Rechtsverstößen werden jedoch derartige externe
            Links unverzüglich gelöscht.
            <br />
            <br />
            § 3 Urheber- und Leistungsschutzrechte
            <br />
            Die auf dieser Website veröffentlichten Inhalte unterliegen dem
            deutschen Urheber- und Leistungsschutzrecht. Jede vom deutschen
            Urheber- und Leistungsschutzrecht nicht zugelassene Verwertung
            bedarf der vorherigen schriftlichen Zustimmung des Anbieters oder
            jeweiligen Rechteinhabers. Dies gilt insbesondere für
            Vervielfältigung, Bearbeitung, Übersetzung, Einspeicherung,
            Verarbeitung bzw. Wiedergabe von Inhalten in Datenbanken oder
            anderen elektronischen Medien und Systemen. Inhalte und Rechte
            Dritter sind dabei als solche gekennzeichnet. Die unerlaubte
            Vervielfältigung oder Weitergabe einzelner Inhalte oder kompletter
            Seiten ist nicht gestattet und strafbar. Lediglich die Herstellung
            von Kopien und Downloads für den persönlichen, privaten und nicht
            kommerziellen Gebrauch ist erlaubt.
            <br />
            <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            Verandwortlich für den Inhalt
          </SoftTypography>
          <SoftTypography fontSize="small">
            {import.meta.env.VITE_NAME} <br />
            {import.meta.env.VITE_ADDRESS_L1} <br />
            {import.meta.env.VITE_ADDRESS_L2} <br />
            E-Mail: {import.meta.env.VITE_EMAIL} <br />
            <br />
          </SoftTypography>
          <SoftTypography fontSize="small" fontWeight="medium">
            Datenschutz
          </SoftTypography>
          <SoftTypography fontSize="small">
            Die Nutzung unserer Webseite ist in der Regel ohne Angabe
            personenbezogener Daten möglich. Soweit auf unseren Seiten
            personenbezogene Daten (beispielsweise Name, Anschrift oder
            eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets
            auf freiwilliger Basis. Diese Daten werden ohne Ihre ausdrückliche
            Zustimmung nicht an Dritte weitergegeben. <br />
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B.
            bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann.
            Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist
            nicht möglich. Der Nutzung von im Rahmen der Impressumspflicht
            veröffentlichten Kontaktdaten durch Dritte zur Übersendung von nicht
            ausdrücklich angeforderter Werbung und Informationsmaterialien wird
            hiermit ausdrücklich widersprochen. Die Betreiber der Seiten
            behalten sich ausdrücklich rechtliche Schritte im Falle der
            unverlangten Zusendung von Werbeinformationen, etwa durch
            Spam-Mails, vor.
            <br />
            <br />
          </SoftTypography>
        </SoftBox>
      </Collapse>
    </>
  );
};

export default Footer;
