import {
  AppBar,
  Button,
  Skeleton,
  ToggleButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import CategoryIcon from "@mui/icons-material/Category";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setIsEditMode,
  toggleTacticBoardItemsDrawerOpen,
} from "../tacticBoardSlice";
import { useTranslation } from "react-i18next";
import { SoftTypography } from "../../../components";

type TacticBoardTopMenuProps = {
  tacticBoard: TacticBoard;
  isTacticBoardLoading: boolean;
};

const TacticBoardTopMenu = ({
  tacticBoard,
  isTacticBoardLoading,
}: TacticBoardTopMenuProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("TacticBoard");

  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);

  const toggleItems = () => {
    dispatch(toggleTacticBoardItemsDrawerOpen());
  };

  const onToggleEditMode = () => {
    dispatch(setIsEditMode(!isEditMode));
  };

  return (
    <AppBar
      position="relative"
      color="primary"
      sx={(theme) => ({ mx: 3, width: `calc(100% - 2 * ${theme.spacing(3)})` })}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignContent: "center",
        }}
      >
        <Tooltip
          title={t("TacticBoard:topMenu.isEditModeButton.tooltip", {
            context: isEditMode ? "editMode" : "viewMode",
          })}
        >
          <ToggleButton
            value={isEditMode}
            size="small"
            selected={isEditMode}
            onChange={onToggleEditMode}
            sx={(theme) => ({
              color: theme.palette.primary.contrastText,
              mr: 1,
            })}
          >
            {isEditMode ? <SaveIcon /> : <EditIcon />}
          </ToggleButton>
        </Tooltip>
        {isEditMode && (
          <Tooltip
            title={t("TacticBoard:topMenu.itemsMenuButton.tooltip", {
              context: tacticBoardItemsDrawerOpen ? "open" : "closed",
            })}
          >
            <ToggleButton
              value={tacticBoardItemsDrawerOpen}
              selected={tacticBoardItemsDrawerOpen}
              onChange={toggleItems}
              size="small"
              sx={(theme) => ({
                color: theme.palette.primary.contrastText,
                mr: 1,
              })}
            >
              <CategoryIcon />
            </ToggleButton>
          </Tooltip>
        )}
        {isEditMode ? (
          <Tooltip
            title={t("TacticBoard:topMenu.renameTacticBoadButton.tooltip")}
          >
            <Button
              endIcon={<EditIcon />}
              sx={(theme) => ({
                color: theme.palette.primary.contrastText,
                mr: 1,
              })}
            >
              {isTacticBoardLoading ? (
                <Skeleton variant="rectangular" />
              ) : (
                <SoftTypography variant="body1">
                  {tacticBoard.name}
                </SoftTypography>
              )}
            </Button>
          </Tooltip>
        ) : isTacticBoardLoading ? (
          <Skeleton variant="rectangular" />
        ) : (
          <SoftTypography variant="body1">{tacticBoard.name}</SoftTypography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TacticBoardTopMenu;
