import { List, ListSubheader } from "@mui/material";
import { SoftBox } from "../../../components";
import PersonItemsSection from "./PersonItemsSection";
import { useTranslation } from "react-i18next";
import BallItemsSection from "./BallItemsSection";
import AccessoryItemSection from "./AccessoryItemSection";

const TacticBoardItemsDrawer = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");

  return (
    <SoftBox sx={(theme) => ({ height: "100%", bgcolor: "background.paper" })}>
      <List
        sx={{ width: "100%", bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby={t("TacticBoard:itemsDrawer.title")}
        subheader={
          <ListSubheader component="div">
            {t("TacticBoard:itemsDrawer.title")}
          </ListSubheader>
        }
      >
        <PersonItemsSection teamA={true} />
        <PersonItemsSection teamA={false} />
        <BallItemsSection />
        <AccessoryItemSection />
      </List>
    </SoftBox>
  );
};

export default TacticBoardItemsDrawer;
