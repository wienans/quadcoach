import {
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { SoftBox } from "../../../components";
import DrawIcon from "@mui/icons-material/Draw";
import LayersIcon from "@mui/icons-material/Layers";
import DeleteIcon from "@mui/icons-material/Delete";
import { toggleTacticBoardItemsDrawerOpen } from "../tacticBoardSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useTacticBoardFabricJs } from "../../../hooks";

type TacticBoardTopItemMenuProps = {
  isPrivileged: boolean;
  isEditMode: boolean;
  onDelete: () => void;
};

const TacticBoardTopItemsMenu = ({
  isPrivileged,
  isEditMode,
  onDelete,
}: TacticBoardTopItemMenuProps): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const dispatch = useAppDispatch();
  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const [drawingEnabled, enableDrawing] = useState<boolean>(false);
  const [backgroundImageId, setBackgorundImageId] = useState<string>("");
  const { setDrawMode, setBackgroundImage, getBackgroundImage } =
    useTacticBoardFabricJs();
  const toggleItems = () => {
    dispatch(toggleTacticBoardItemsDrawerOpen());
  };

  useEffect(() => {
    setBackgorundImageId(getBackgroundImage());
  }, [getBackgroundImage]);

  return (
    <SoftBox
      sx={{
        bgcolor: "background.paper",
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "40px",
      }}
    >
      <SoftBox
        sx={{
          bgcolor: "background.paper",
          display: "flex",
          mx: 1,
          alignItems: "center",
          height: "100%",
        }}
      >
        {/* MENU BUTTON START */}
        {isPrivileged && isEditMode && (
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
              sx={{
                mr: 1,
              }}
            >
              <LayersIcon />
            </ToggleButton>
          </Tooltip>
        )}
        {/* MENU BUTTON END */}
        {/* DRAW BUTTON START */}
        {isPrivileged && isEditMode && (
          <Tooltip
            title={t("TacticBoard:topMenu.drawingButton.tooltip", {
              context: drawingEnabled ? "disable" : "enable",
            })}
          >
            <ToggleButton
              value={drawingEnabled}
              selected={drawingEnabled}
              disabled={!isEditMode}
              onChange={() => {
                setDrawMode(!drawingEnabled);
                enableDrawing(!drawingEnabled);
              }}
              size="small"
              sx={{
                mr: 1,
              }}
            >
              <DrawIcon />
            </ToggleButton>
          </Tooltip>
        )}
        {/* DRAW BUTTON END */}
        {/* DELETE BUTTON START */}
        {isPrivileged && isEditMode && (
          <Tooltip title={t("TacticBoard:topMenu.objectDeleteButton.tooltip")}>
            <ToggleButton
              value={false}
              selected={false}
              disabled={!isEditMode}
              onChange={onDelete}
              size="small"
              sx={{
                mr: 1,
              }}
            >
              <DeleteIcon />
            </ToggleButton>
          </Tooltip>
        )}
        {/* DELETE BUTTON END */}
        <Select
          labelId="court-select-label"
          id="court-select"
          sx={{
            height: "30px",
            ml: 2,
          }}
          value={backgroundImageId}
          label={t("UpdateTacticBoardMeta:info.backgroundImage.label")}
          onChange={(event: SelectChangeEvent) => {
            setBackgorundImageId(event.target.value);
            setBackgroundImage(event.target.value);
          }}
        >
          <MenuItem value={"/full-court.svg"}>Full Court</MenuItem>
          <MenuItem value={"/half-court.svg"}>Half Court</MenuItem>
          <MenuItem value={"/empty-court.svg"}>Empty Court</MenuItem>
        </Select>
      </SoftBox>
    </SoftBox>
  );
};

export default TacticBoardTopItemsMenu;
