import { IconButton, Menu, MenuItem } from "@mui/material";
import { SoftBox } from "..";
import TranslateIcon from "@mui/icons-material/Translate";
import Icon from "@mui/material/Icon";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setMiniSideNav } from "../Layout/layoutSlice";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";

type Language = {
  code: string;
  label: string;
};

const languages: Language[] = [
  {
    code: "de",
    label: "Deutsch",
  },
  {
    code: "en",
    label: "English",
  },
];

const NavbarMainControls = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);
  const [openLangugageMenu, setOpenLanguageMenu] = useState<
    HTMLButtonElement | undefined
  >();

  const currentLanguageCode =
    languages.find((language) => language.code === i18n.language)?.code ??
    languages[0].code;

  const handleMiniSidenav = () => {
    dispatch(setMiniSideNav(!miniSidenav));
  };

  const handleOpenLanguageMenu = (event: MouseEvent<HTMLButtonElement>) =>
    setOpenLanguageMenu(event.currentTarget);
  const handleCloseLanguageMenu = () => {
    setOpenLanguageMenu(undefined);
  };

  const handleLanguageMenuItemClicked = (newLanguageCode: string) => () => {
    i18n.changeLanguage(newLanguageCode);
    handleCloseLanguageMenu();
  };

  return (
    <SoftBox
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <IconButton size="small" color="inherit" onClick={handleOpenLanguageMenu}>
        <TranslateIcon />
      </IconButton>
      <IconButton size="small" color="inherit" onClick={handleMiniSidenav}>
        <Icon className="text-dark">{miniSidenav ? "menu_open" : "menu"}</Icon>
      </IconButton>
      <Menu
        anchorEl={openLangugageMenu}
        anchorReference={undefined}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={Boolean(openLangugageMenu)}
        onClose={handleCloseLanguageMenu}
        sx={{ mt: 2 }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            selected={language.code === currentLanguageCode}
            disabled={language.code === currentLanguageCode}
            onClick={handleLanguageMenuItemClicked(language.code)}
          >
            {language.label}
          </MenuItem>
        ))}
      </Menu>
    </SoftBox>
  );
};

export default NavbarMainControls;
