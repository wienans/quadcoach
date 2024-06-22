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
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CircleIcon from "@mui/icons-material/Circle";
import { PersonType } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { useTranslation } from "react-i18next";

const getPersonColor = (
  personType: PersonType,
  theme: Theme,
): SxProps<Theme> | undefined => {
  switch (personType) {
    case PersonType.Beater:
      return {
        color: theme.palette.black.main,
      };
    case PersonType.Chaser:
      return {
        color: theme.palette.white.main,
      };
    case PersonType.Keeper:
      return {
        color: "green",
      };
    case PersonType.Seeker:
      return {
        color: "yellow",
      };
  }
};

const PersonItemsSection = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const [open, setOpen] = useState<boolean>(true);

  const handleToggleOpen = () => setOpen(!open);

  const onPersonAddClick = (personType: PersonType) => () => {
    console.log(personType);
  };

  return (
    <>
      <ListItemButton onClick={handleToggleOpen}>
        <ListItemIcon>
          <PersonAddAlt1Icon />
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
                <Avatar>
                  <CircleIcon
                    sx={(theme) => ({
                      ...getPersonColor(value, theme),
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

export default PersonItemsSection;
