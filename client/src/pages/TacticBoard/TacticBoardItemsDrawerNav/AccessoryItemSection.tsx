/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import { useTacticBoardCanvas } from "../../../hooks/taticBoard";
import {
  createExtendedGroup,
  setUuid,
} from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";

const getAccesTypeSvg = (accessType: AccessoryType) => {
  switch (accessType) {
    case AccessoryType.RedCone:
      return "/cone-red.svg";
    case AccessoryType.BlueCone:
      return "/cone-blue.svg";
    case AccessoryType.YellowCone:
      return "/cone-yellow.svg";
    case AccessoryType.Hoop:
      return "/hoop.svg";
    case AccessoryType.Ladder:
      return "/ladder.svg";
    case AccessoryType.Hurdle:
      return "/hurdle.svg";
  }
};

const getAccesTypeScale = (accessType: AccessoryType) => {
  switch (accessType) {
    case AccessoryType.RedCone:
    case AccessoryType.BlueCone:
    case AccessoryType.YellowCone:
      return 0.04;
    case AccessoryType.Hoop:
      return 0.45;
    case AccessoryType.Ladder:
      return 0.1;
    case AccessoryType.Hurdle:
      return 0.06;
  }
};

const AccessoryItemSection = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { addObject } = useTacticBoardCanvas();
  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);

  const onAccessoryAddClick = (accessType: AccessoryType) => () => {
    fabric.loadSVGFromURL(
      getAccesTypeSvg(accessType),
      function (objects, options) {
        const obj = fabric.util.groupSVGElements(objects as any, {
          ...options,
          uuid: uuidv4(),
        } as any);
        obj.scaleX = getAccesTypeScale(accessType);
        obj.scaleY = getAccesTypeScale(accessType);
        obj.left = 600;
        obj.top = 333;
        obj.hasControls = false;
        setUuid(obj, uuidv4());
        if (accessType === AccessoryType.Hoop) {
          // Need to group the hoop as it has some weird behavior when saving to DB
          const group = createExtendedGroup([obj], {
            hasControls: false, // Disable resizing handles
          });
          setUuid(group, uuidv4());
          addObject(group);
        } else {
          addObject(obj);
        }
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
                  <Icon
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={getAccesTypeSvg(value)}
                      style={
                        value === AccessoryType.Hoop
                          ? {
                              width: "20px",
                            }
                          : value === AccessoryType.Hurdle
                          ? {
                              width: "22px",
                            }
                          : value === AccessoryType.Ladder
                          ? {
                              width: "13px",
                            }
                          : {
                              width: "28px",
                            }
                      }
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
