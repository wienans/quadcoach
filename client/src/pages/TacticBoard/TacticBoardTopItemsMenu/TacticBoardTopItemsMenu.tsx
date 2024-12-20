import {
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  Tooltip,
  IconButton,
  Slider,
  ToggleButtonGroup,
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
import { ChromePicker, ColorResult } from "react-color";
import Popover from "@mui/material/Popover";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { LineStyle } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/TacticBoardFabricJsContext";

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
  const {
    setDrawMode,
    setBackgroundImage,
    getBackgroundImage,
    setDrawColor,
    setDrawThickness,
    getDrawColor,
    getDrawThickness,
    setLineStyle,
    getLineStyle,
  } = useTacticBoardFabricJs();
  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const [drawingEnabled, enableDrawing] = useState<boolean>(false);
  const [backgroundImageId, setBackgorundImageId] = useState<string>("");
  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentThickness, setCurrentThickness] = useState(1);
  const [currentLineStyle, setCurrentLineStyle] = useState<LineStyle>(
    getLineStyle(),
  );

  const toggleItems = () => {
    dispatch(toggleTacticBoardItemsDrawerOpen());
  };

  useEffect(() => {
    const image = getBackgroundImage();
    if (image) {
      setBackgorundImageId(image);
    }
  }, [getBackgroundImage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && isPrivileged && isEditMode) {
        onDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPrivileged, isEditMode, onDelete]);

  useEffect(() => {
    setCurrentColor(getDrawColor());
    setCurrentThickness(getDrawThickness());
  }, [getDrawColor, getDrawThickness]);

  const handleColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchor(event.currentTarget);
  };

  const handleColorPickerClose = () => {
    setColorPickerAnchor(null);
  };

  const colorPickerOpen = Boolean(colorPickerAnchor);

  const handleColorChange = (color: ColorResult) => {
    setCurrentColor(color.hex);
    setDrawColor(color.hex);
  };

  const handleThicknessChange = (_event: Event, value: number | number[]) => {
    const thickness = value as number;
    setCurrentThickness(thickness);
    setDrawThickness(thickness);
  };

  const handleLineStyleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newStyle: LineStyle,
  ) => {
    if (newStyle !== null) {
      setCurrentLineStyle(newStyle);
      setLineStyle(newStyle);
    }
  };

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
            <span>
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
            </span>
          </Tooltip>
        )}
        {/* MENU BUTTON END */}
        {/* DRAW BUTTON START */}
        {isPrivileged && isEditMode && (
          <>
            <Tooltip
              title={t("TacticBoard:topMenu.drawingButton.tooltip", {
                context: drawingEnabled ? "disable" : "enable",
              })}
            >
              <span>
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
              </span>
            </Tooltip>
            {drawingEnabled && (
              <>
                <ToggleButtonGroup
                  value={currentLineStyle}
                  exclusive
                  onChange={handleLineStyleChange}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <ToggleButton value="solid">―</ToggleButton>
                  <ToggleButton value="dashed">- -</ToggleButton>
                  <ToggleButton value="dotted">...</ToggleButton>
                </ToggleButtonGroup>
                <IconButton
                  size="small"
                  onClick={handleColorPickerOpen}
                  sx={{
                    mr: 1,
                    backgroundColor: currentColor,
                    width: 30,
                    height: 30,
                    "&:hover": {
                      backgroundColor: currentColor,
                    },
                  }}
                >
                  <ColorLensIcon sx={{ color: "#ffffff" }} />
                </IconButton>
                <Popover
                  open={colorPickerOpen}
                  anchorEl={colorPickerAnchor}
                  onClose={handleColorPickerClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <ChromePicker
                    color={currentColor}
                    onChange={handleColorChange}
                    onChangeComplete={handleColorChange}
                  />
                </Popover>
                <Slider
                  value={currentThickness}
                  onChange={handleThicknessChange}
                  min={1}
                  max={20}
                  valueLabelDisplay="auto"
                  sx={{ width: 100, ml: 1, mr: 2 }}
                />
              </>
            )}
          </>
        )}
        {/* DRAW BUTTON END */}
        {/* DELETE BUTTON START */}
        {isPrivileged && isEditMode && (
          <Tooltip title={t("TacticBoard:topMenu.objectDeleteButton.tooltip")}>
            <span>
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
            </span>
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
          label={t("TacticBoard:info.backgroundImage.label")}
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
