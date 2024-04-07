import "./translations";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { SoftBox, SoftTypography } from "..";
import TranslateIcon from "@mui/icons-material/Translate";
import Icon from "@mui/material/Icon";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setMiniSideNav } from "../Layout/layoutSlice";
import { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSendLogoutMutation } from "../../pages/authApi";
import { useAuth } from "../../store/hooks";
import { useNavigate } from "react-router-dom";

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

export type NavbarMainControlsProps = {
  light: boolean;
};

const NavbarMainControls = ({
  light,
}: NavbarMainControlsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);
  const [openLangugageMenu, setOpenLanguageMenu] = useState<
    HTMLButtonElement | undefined
  >();
  const { t } = useTranslation("NavbarMainControls");
  const { name, status } = useAuth();

  const navigate = useNavigate();

  const currentLanguageCode =
    languages.find((language) => language.code === i18n.language)?.code ??
    languages[0].code;

  const [sendLogout] = useSendLogoutMutation();
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
      {status != null && (
        <>
          <SoftTypography sx={{ mr: 1 }} variant="body2">
            {t("NavbarMainControls:welcome", { name: name })}
          </SoftTypography>
          <IconButton
            size="small"
            color="inherit"
            onClick={() => {
              sendLogout();
              navigate("/");
            }}
            sx={(theme) => ({
              color: light
                ? theme.palette.white.main
                : theme.palette.black.main,
            })}
          >
            <LogoutIcon />
          </IconButton>
        </>
      )}
      {status === null && (
        <IconButton
          size="small"
          color="inherit"
          onClick={() => navigate("/login")}
          sx={(theme) => ({
            color: light ? theme.palette.white.main : theme.palette.black.main,
          })}
        >
          <LoginIcon />
        </IconButton>
      )}
      <IconButton
        size="small"
        color="inherit"
        onClick={handleOpenLanguageMenu}
        sx={(theme) => ({
          color: light ? theme.palette.white.main : theme.palette.black.main,
        })}
      >
        <TranslateIcon />
      </IconButton>
      <IconButton
        size="small"
        color="inherit"
        onClick={handleMiniSidenav}
        sx={(theme) => ({
          color: light ? theme.palette.white.main : theme.palette.black.main,
        })}
      >
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
