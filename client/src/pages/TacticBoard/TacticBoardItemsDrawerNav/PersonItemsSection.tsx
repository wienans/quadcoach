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
import {
  useTacticBoardCanvas,
  useTacticBoardData,
} from "../../../hooks/taticBoard";
import { cloneDeep } from "lodash";
import {
  createPlayer,
  getFabricPersonColor,
  teamAInfo,
  teamBInfo,
} from "../playerFactory";

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
    (
      getAllObjectsJson() as {
        objects: Array<{
          objectType?: string;
          objects?: Array<{ text?: string }>;
        }>;
      }
    ).objects.forEach((obj) => {
      if (obj.objectType == (teamA ? "playerA" : "playerB")) {
        numbers = [...numbers, parseInt(obj.objects?.[1]?.text || "0")];
      }
    });
    return findNumberInArray(numbers);
  };

  const onPersonAddClick = (personType: PersonType) => () => {
    const playerLeft = teamA ? 250 : 1220 - 250 - 30;
    const playerTop = 640;
    const newNumber = getNextNumber();

    addObject(
      createPlayer({
        personType,
        number: newNumber,
        left: playerLeft,
        top: playerTop,
        teamA,
      }),
    );
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
