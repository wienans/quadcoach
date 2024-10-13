import {
  Avatar,
  Collapse,
  Icon,
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
import { AccessoryType } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { useTranslation } from "react-i18next";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { useTacticBoardFabricJs } from "../../../hooks";

const getAccesTypeSvg = (accessType: AccessoryType) => {
  switch (accessType) {
    case AccessoryType.RedCone:
      return "/cone-red.svg";
    case AccessoryType.BlueCone:
      return "/cone-blue.svg";
    case AccessoryType.YellowCone:
      return "/cone-yellow.svg";
  }
};

const AccessoryItemSection = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { addObject } = useTacticBoardFabricJs();
  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);

  const onAccessoryAddClick = (accessType: AccessoryType) => () => {
    fabric.loadSVGFromURL(
      getAccesTypeSvg(accessType),
      function (objects, options) {
        const obj = fabric.util.groupSVGElements(objects, {
          ...options,
          uuid: uuidv4(),
        });
        obj.scaleX = 0.04;
        obj.scaleY = 0.04;
        obj.left = 600;
        obj.top = 333;
        obj.hasControls = false;
        addObject(obj);
      },
    );
  };

  return (
    <>
      <ListItemButton onClick={handleToggleOpen}>
        <ListItemIcon>
          <SportsVolleyballIcon />
        </ListItemIcon>
        <ListItemText
          primary={t("TacticBoard:itemsDrawer.accessoryItemsSection.title")}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(AccessoryType).map(([key, value]) => (
            <ListItemButton
              sx={{ pl: 4 }}
              key={key}
              onClick={onAccessoryAddClick(value)}
            >
              <ListItemAvatar>
                <Avatar>
                  <Icon>
                    <img
                      src={getAccesTypeSvg(value)}
                      style={{
                        width: "28px",
                        marginTop: "-4px",
                        marginLeft: "-4px",
                      }}
                    />
                  </Icon>
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

export default AccessoryItemSection;
