import {
  Avatar,
  Collapse,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
} from "@mui/material";
import { useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import CircleIcon from "@mui/icons-material/Circle";
import { BallType } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { useTranslation } from "react-i18next";

const getBallTypeColor = (
  ballType: BallType,
  theme: Theme,
): SxProps<Theme> | undefined => {
  switch (ballType) {
    case BallType.Dodgeball:
      return {
        color: theme.palette.grey[600],
      };
    case BallType.Volleyball:
      return {
        color: theme.palette.white.main,
      };
    case BallType.FlagRunner:
      return {
        color: "yellow",
      };
  }
};

const BallItemsSection = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);

  const onBallAddClick = (ballType: BallType) => () => {
    console.log(ballType);
  };

  return (
    <>
      <ListItemButton onClick={handleToggleOpen}>
        <ListItemIcon>
          <SportsVolleyballIcon />
        </ListItemIcon>
        <ListItemText
          primary={t("TacticBoard:itemsDrawer.ballItemsSection.title")}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(BallType).map(([key, value]) => (
            <ListItemButton
              sx={{ pl: 4 }}
              key={key}
              onClick={onBallAddClick(value)}
            >
              <ListItemAvatar>
                <Avatar>
                  <CircleIcon
                    sx={(theme) => ({
                      ...getBallTypeColor(value, theme)
                    })}
                  />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={value} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default BallItemsSection;
