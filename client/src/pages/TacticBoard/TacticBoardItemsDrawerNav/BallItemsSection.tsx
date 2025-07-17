import {
  Avatar,
  Collapse,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import CircleIcon from "@mui/icons-material/Circle";
import { BallType } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { useTacticBoardCanvas } from "../../../hooks/taticBoard";
import {
  createExtendedCircle,
  setUuid,
} from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";

const getBallTypeColor = (ballType: BallType) => {
  switch (ballType) {
    case BallType.Dodgeball:
      return "#808080";
    case BallType.Volleyball:
      return "#ffffff";
    case BallType.FlagRunner:
      return "#FFD700";
  }
};

const BallItemsSection = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { addObject } = useTacticBoardCanvas();
  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);

  const onBallAddClick = (ballType: BallType) => () => {
    const circle = createExtendedCircle({
      radius: 10,
      stroke: "#000000", // Set the color of the stroke
      strokeWidth: 2, // Set the width of the stroke
      left: 600,
      top: 333,
      fill: getBallTypeColor(ballType),
      hasControls: false, // Disable resizing handles
    });
    setUuid(circle, uuidv4());
    addObject(circle);
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
                    sx={{
                      color: getBallTypeColor(value),
                    }}
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
