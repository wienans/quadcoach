import { List, ListSubheader } from "@mui/material";
import { SoftBox } from "../../../components";
import PersonItemsSection from "./PersonItemsSection";
import { useTranslation } from "react-i18next";
import BallItemsSection from "./BallItemsSection";
import AccessoryItemSection from "./AccessoryItemSection";

const TacticBoardItemsDrawer = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");

  return (
    <SoftBox sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      <ListSubheader component="div" sx={{ bgcolor: "background.paper" }}>
        {t("TacticBoard:itemsDrawer.title")}
      </ListSubheader>
      <List
        sx={{ 
          flex: 1, 
          overflow: "auto",
          width: "100%", 
          bgcolor: "background.paper" 
        }}
        component="nav"
        aria-labelledby={t("TacticBoard:itemsDrawer.title")}
        disablePadding
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
