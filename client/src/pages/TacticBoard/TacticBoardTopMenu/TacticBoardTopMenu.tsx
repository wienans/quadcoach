import {
  Pagination,
  Skeleton,
  ToggleButton,
  Toolbar,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import MovieIcon from "@mui/icons-material/Movie";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setIsEditMode } from "../tacticBoardSlice";
import { useTranslation } from "react-i18next";
import { SoftBox, SoftTypography } from "../../../components";
import { useTacticBoardFabricJs } from "../../../hooks";
import { useNavigate } from "react-router-dom";

type TacticBoardTopMenuProps = {
  saveTacticBoard: () => void;
  tacticBoard: TacticBoard;
  isTacticBoardLoading: boolean;
  isPrivileged: boolean;
  currentPage: number;
  onLoadPage: (page: number, newPage?: boolean, removePage?: boolean) => void;
  setPage: (page: number) => void;
  setMaxPages: (maxPages: number) => void;
  maxPages: number;
  isAnimating: boolean;
  onAnimateClick: () => void;
  isRecording: boolean;
  onRecordClick: () => void;
  onDeleteTacticBoard: () => void;
  onFullScreenClick: () => void;
  isFullScreen: boolean;
};

const TacticBoardTopMenu = ({
  saveTacticBoard,
  tacticBoard,
  isTacticBoardLoading,
  isPrivileged,
  currentPage,
  onLoadPage,
  setPage,
  setMaxPages,
  maxPages,
  isAnimating,
  onAnimateClick,
  isRecording,
  onRecordClick,
  onDeleteTacticBoard,
  onFullScreenClick,
  isFullScreen,
}: TacticBoardTopMenuProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("TacticBoard");
  const { setSelection } = useTacticBoardFabricJs();
  const navigate = useNavigate();
  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);

  const onToggleEditMode = () => {
    if (isPrivileged && isEditMode) {
      saveTacticBoard();
    }
    setSelection(!isEditMode);
    dispatch(setIsEditMode(!isEditMode));
  };

  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };

  return (
    <SoftBox
      variant="gradient"
      shadow="lg"
      opacity={1}
      //p={1}
      // my={2}
      position="relative"
      color="secondary"
      sx={(theme) => ({ mx: 3, width: `calc(100% - 2 * ${theme.spacing(3)})` })}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignContent: "center",
        }}
      >
        <Tooltip title={t("TacticBoard:topMenu.backButton.tooltip")}>
          <span>
            <ToggleButton
              disabled={isTacticBoardLoading}
              value={false}
              size="small"
              selected={false}
              onChange={() => {
                navigate(`/tacticboards/${tacticBoard._id}`);
              }}
              sx={{
                mr: 1,
              }}
            >
              <ArrowBackIcon sx={{ color: "#000000" }} />
            </ToggleButton>
          </span>
        </Tooltip>

        {/* NAME START */}
        {isTacticBoardLoading ? (
          <Skeleton variant="rectangular" />
        ) : (
          <SoftTypography color="black">{tacticBoard.name}</SoftTypography>
        )}
        {/* NAME END */}
        {/* PAGINATION START */}
        <SoftBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{ flexGrow: 1 }}
        >
          {/* ANIMATION BUTTON START */}
          {!isEditMode && (
            <Tooltip
              title={t("TacticBoard:topMenu.isAnimatingButton.tooltip", {
                context: isAnimating ? "animationMode" : "pauseMode",
              })}
            >
              <span>
                <ToggleButton
                  disabled={isRecording}
                  value={isAnimating}
                  size="small"
                  selected={isAnimating}
                  onChange={onAnimateClick}
                  sx={{
                    mr: 1,
                  }}
                >
                  {isAnimating ? (
                    <PauseCircleIcon sx={{ color: "#000000" }} />
                  ) : (
                    <PlayCircleIcon sx={{ color: "#000000" }} />
                  )}
                </ToggleButton>
              </span>
            </Tooltip>
          )}

          {/* ANIMATION BUTTON END */}
          {isPrivileged && isEditMode && (
            <Tooltip
              title={t("TacticBoard:topMenu.pagination.tooltip_removePage")}
            >
              <span>
                <ToggleButton
                  disabled={
                    isTacticBoardLoading ||
                    maxPages == 1 ||
                    currentPage != maxPages
                  }
                  value={false}
                  selected={false}
                  onChange={() => {
                    if (maxPages > 1) {
                      setMaxPages(maxPages - 1);
                      setPage(currentPage - 1);
                      onLoadPage(currentPage - 1, false, true);
                    }
                  }}
                  size="small"
                  sx={{
                    mr: 1,
                  }}
                >
                  <RemoveIcon />
                </ToggleButton>
              </span>
            </Tooltip>
          )}

          <Pagination
            count={maxPages}
            siblingCount={0}
            boundaryCount={0}
            page={currentPage}
            disabled={isTacticBoardLoading || isRecording || isAnimating}
            onChange={handleChange}
          />
          {isPrivileged && isEditMode && (
            <Tooltip
              title={t("TacticBoard:topMenu.pagination.tooltip_addPage")}
            >
              <span>
                <ToggleButton
                  disabled={isTacticBoardLoading || currentPage != maxPages}
                  value={false}
                  selected={false}
                  onChange={() => {
                    setMaxPages(maxPages + 1);
                    setPage(currentPage + 1);
                    onLoadPage(currentPage + 1, true, false);
                  }}
                  size="small"
                  sx={{
                    mr: 1,
                  }}
                >
                  <AddIcon />
                </ToggleButton>
              </span>
            </Tooltip>
          )}
          {!isEditMode && (
            <Tooltip title={t("TacticBoard:topMenu.isRecordingButton.tooltip")}>
              <span>
                <ToggleButton
                  disabled={isAnimating}
                  value={false}
                  size="small"
                  selected={false}
                  onChange={onRecordClick}
                  sx={{
                    mr: 1,
                  }}
                >
                  <MovieIcon sx={{ color: "#000000" }} />
                </ToggleButton>
              </span>
            </Tooltip>
          )}
        </SoftBox>
        {/* PAGINATION END */}
        <Tooltip title={t("TacticBoard:topMenu.isFullscreenButton.tooltip")}>
          <span>
            <ToggleButton
              disabled={isTacticBoardLoading || isRecording || isAnimating}
              value={isFullScreen}
              size="small"
              selected={isFullScreen}
              onChange={onFullScreenClick}
              sx={{
                mr: 1,
              }}
            >
              {isFullScreen ? (
                <FullscreenExitIcon color="primary" />
              ) : (
                <FullscreenIcon color="primary" />
              )}
            </ToggleButton>
          </span>
        </Tooltip>
        {/* EDIT/SAVE BUTTON START */}
        {isPrivileged && (
          <Tooltip
            title={t("TacticBoard:topMenu.isEditModeButton.tooltip", {
              context: isEditMode ? "editMode" : "viewMode",
            })}
          >
            <span>
              <ToggleButton
                disabled={isTacticBoardLoading || isRecording || isAnimating}
                value={isEditMode}
                size="small"
                selected={isEditMode}
                onChange={onToggleEditMode}
                sx={{
                  mr: 1,
                }}
              >
                {isEditMode ? (
                  <SaveIcon color="primary" />
                ) : (
                  <EditIcon color="primary" />
                )}
              </ToggleButton>
            </span>
          </Tooltip>
        )}
        {isPrivileged && (
          <Tooltip title={t("TacticBoard:topMenu.deleteButton.tooltip")}>
            <span>
              <ToggleButton
                disabled={isTacticBoardLoading || isRecording || isAnimating}
                value={false}
                size="small"
                selected={false}
                onChange={onDeleteTacticBoard}
              >
                <DeleteIcon color="error" />
              </ToggleButton>
            </span>
          </Tooltip>
        )}
        {/* EDIT/SAVE BUTTON END */}
      </Toolbar>
    </SoftBox>
  );
};

export default TacticBoardTopMenu;
