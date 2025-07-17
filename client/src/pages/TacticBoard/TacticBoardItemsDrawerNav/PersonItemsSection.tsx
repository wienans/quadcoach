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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CircleIcon from "@mui/icons-material/Circle";
import { PersonType } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { useTranslation } from "react-i18next";
import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";
import { useTacticBoardCanvas, useTacticBoardData } from "../../../hooks/taticBoard";
import { cloneDeep } from "lodash";

const getFabricPersonColor = (personType: PersonType): string | undefined => {
  switch (personType) {
    case PersonType.Beater:
      return "#000000";
    case PersonType.Chaser:
      return "#ffffff";
    case PersonType.Keeper:
      return "#03fc35";
    case PersonType.Seeker:
      return "#fcfc00";
  }
};

const findNumberInArray = (array: number[]) => {
  const clonedArray = cloneDeep(array);
  clonedArray.sort(function (a, b) {
    return a - b;
  });

  let lowest = -1;
  for (let i = 0; i < clonedArray.length; ++i) {
    if (clonedArray[i] != i) {
      lowest = i;
      break;
    }
  }
  if (lowest == -1) {
    lowest = clonedArray[clonedArray.length - 1] + 1;
  }
  return lowest;
};
const teamAInfo = {
  color: "#3d85c6",
};
const teamBInfo = {
  color: "#dd2d2d",
};

export type PersonItemsSectionProps = {
  teamA: boolean;
};

const PersonItemsSection = ({
  teamA,
}: PersonItemsSectionProps): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { addObject } = useTacticBoardCanvas();
  const { getAllObjectsJson } = useTacticBoardData();

  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);
  const getNextNumber = () => {
    let numbers: number[] = [0];
    // @ts-ignore
    getAllObjectsJson().objects.forEach((obj) => {
      if (obj.objectType == (teamA ? "playerA" : "playerB")) {
        numbers = [...numbers, parseInt(obj.objects[1].text)];
      }
    });
    return findNumberInArray(numbers);
  };

  const onPersonAddClick = (personType: PersonType) => () => {
    const circle = new fabric.Circle({
      radius: 15,
      left: teamA ? 250 : 1220 - 250 - 30,
      top: 640,
      stroke: getFabricPersonColor(personType), // Set the color of the stroke
      strokeWidth: 3, // Set the width of the stroke
      fill: teamA ? teamAInfo.color : teamBInfo.color,
      // @ts-ignore
      uuid: uuidv4(),
    });
    const newNumber = getNextNumber();
    const text = new fabric.Text(newNumber.toString(), {
      left: teamA ? 250 + 16 : 1220 - 250 - 30 + 16,
      top: 640 + 16,
      fontFamily: "Arial",
      fontSize: 20,
      textAlign: "center",
      originX: "center",
      originY: "center",
      // @ts-ignore
      uuid: uuidv4(),
    });
    const group = new fabric.Group([circle, text], {
      uuid: uuidv4(),
      // @ts-ignore
      objectType: teamA ? "playerA" : "playerB",
      hasControls: false, // Disable resizing handles
    });
    addObject(group);
  };

  return (
    <>
      <ListItemButton onClick={handleToggleOpen}>
        <ListItemIcon>
          <PersonAddAlt1Icon
            sx={{ color: teamA ? teamAInfo.color : teamBInfo.color }}
          />
        </ListItemIcon>
        <ListItemText
          primary={t("TacticBoard:itemsDrawer.personItemsSection.title")}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {Object.entries(PersonType).map(([key, value]) => (
            <ListItemButton
              sx={{ pl: 4 }}
              key={key}
              onClick={onPersonAddClick(value)}
            >
              <ListItemAvatar>
                <Avatar color="black">
                  <CircleIcon
                    sx={{
                      color: getFabricPersonColor(value),
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

export default PersonItemsSection;
