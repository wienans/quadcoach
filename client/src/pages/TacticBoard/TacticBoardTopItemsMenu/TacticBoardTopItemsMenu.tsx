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
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { toggleTacticBoardItemsDrawerOpen } from "../tacticBoardSlice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import {
  useTacticBoardCanvas,
  useTacticBoardDrawing,
} from "../../../hooks/taticBoard";
import { ChromePicker, ColorResult } from "react-color";
import Popover from "@mui/material/Popover";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { LineStyle } from "../../../contexts/tacticBoard/TacticBoardDrawingContext/TacticBoardDrawingContext";
import * as fabric from "fabric";
import { v4 as uuidv4 } from "uuid";
import { setUuid } from "../../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";

type TacticBoardTopItemMenuProps = {
  isPrivileged: boolean;
  isEditMode: boolean;
  onDelete: () => void;
};

type ToolType = "cursor" | "pencil" | "line" | "text";

const TacticBoardTopItemsMenu = ({
  isPrivileged,
  isEditMode,
  onDelete,
}: TacticBoardTopItemMenuProps): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const dispatch = useAppDispatch();
  const { setBackgroundImage, getBackgroundImage, canvasFabricRef, addObject } =
    useTacticBoardCanvas();

  const {
    setDrawMode,
    setStraightLineMode,
    setDrawColor,
    setDrawThickness,
    getDrawColor,
    getDrawThickness,
    setLineStyle,
    getLineStyle,
    setArrowTipEnabled,
    getArrowTipEnabled,
  } = useTacticBoardDrawing();
  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const [selectedTool, setSelectedTool] = useState<ToolType>("cursor");
  const [backgroundImageId, setBackgorundImageId] = useState<string>("");

  const [colorPickerAnchor, setColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000");

  const [textColorPickerAnchor, setTextColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [selectedTextbox, setSelectedTextbox] = useState<fabric.Textbox | null>(
    null,
  );
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentFontSize, setCurrentFontSize] = useState<number>(24);

  const [currentThickness, setCurrentThickness] = useState(1);
  const [currentLineStyle, setCurrentLineStyle] = useState<LineStyle>(
    getLineStyle(),
  );
  const [arrowTipEnabled, setArrowTipEnabledState] = useState<boolean>(
    getArrowTipEnabled(),
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

  const syncSelectedTextbox = useCallback(() => {
    const canvas = canvasFabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active?.type === "textbox") {
      const textbox = active as fabric.Textbox;
      setSelectedTextbox(textbox);
      setCurrentTextColor(
        typeof textbox.fill === "string" ? textbox.fill : "#000000",
      );
      setCurrentFontSize(textbox.fontSize ?? 24);
    } else {
      setSelectedTextbox(null);
    }
  }, [canvasFabricRef]);

  useEffect(() => {
    setCurrentColor(getDrawColor());
    setCurrentThickness(getDrawThickness());
    setArrowTipEnabledState(getArrowTipEnabled());
  }, [getDrawColor, getDrawThickness, getArrowTipEnabled]);

  useEffect(() => {
    const canvas = canvasFabricRef.current;
    if (!canvas) return;

    const onSelectionCreated = () => {
      syncSelectedTextbox();
    };

    const onSelectionUpdated = () => {
      syncSelectedTextbox();
    };

    const onSelectionCleared = () => {
      setSelectedTextbox(null);
    };

    const onObjectModified = () => {
      syncSelectedTextbox();
    };

    canvas.on("selection:created", onSelectionCreated);
    canvas.on("selection:updated", onSelectionUpdated);
    canvas.on("selection:cleared", onSelectionCleared);
    canvas.on("object:modified", onObjectModified);

    return () => {
      canvas.off("selection:created", onSelectionCreated);
      canvas.off("selection:updated", onSelectionUpdated);
      canvas.off("selection:cleared", onSelectionCleared);
      canvas.off("object:modified", onObjectModified);
    };
  }, [canvasFabricRef, syncSelectedTextbox]);

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

  const handleTextColorPickerOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTextColorPickerAnchor(event.currentTarget);
  };

  const handleTextColorPickerClose = () => {
    setTextColorPickerAnchor(null);
  };

  const textColorPickerOpen = Boolean(textColorPickerAnchor);

  const handleTextColorChange = (color: ColorResult) => {
    const canvas = canvasFabricRef.current;
    if (!canvas || !selectedTextbox) return;

    setCurrentTextColor(color.hex);
    selectedTextbox.set("fill", color.hex);
    canvas.requestRenderAll();
  };

  const handleFontSizeChange = (_event: Event, value: number | number[]) => {
    const canvas = canvasFabricRef.current;
    if (!canvas || !selectedTextbox) return;

    const nextSize = value as number;
    setCurrentFontSize(nextSize);
    selectedTextbox.set("fontSize", nextSize);
    canvas.requestRenderAll();
  };

  const onAddText = useCallback(() => {
    const canvas = canvasFabricRef.current;
    if (!canvas) return;

    const textbox = new fabric.Textbox("Double-click to edit", {
      left: 100,
      top: 100,
      width: 300,
      fontSize: 24,
      fill: "#000000",
      editable: true,
    });

    setUuid(textbox, uuidv4());
    (textbox as fabric.Object & { objectType?: string }).objectType = "textbox";

    addObject(textbox);
    canvas.setActiveObject(textbox);
    canvas.requestRenderAll();
    syncSelectedTextbox();
  }, [addObject, canvasFabricRef, syncSelectedTextbox]);

  const handleToolSelect = useCallback(
    (tool: ToolType) => {
      if (tool === "cursor") {
        setStraightLineMode(false);
        setDrawMode(false);
        setSelectedTool("cursor");
        return;
      }

      if (tool === "pencil") {
        setStraightLineMode(false);
        setLineStyle(currentLineStyle);
        setSelectedTool("pencil");
        return;
      }

      if (tool === "line") {
        setStraightLineMode(true);
        setLineStyle(currentLineStyle);
        setSelectedTool("line");
        return;
      }

      onAddText();
      setStraightLineMode(false);
      setDrawMode(false);
      setSelectedTool("cursor");
    },
    [
      currentLineStyle,
      onAddText,
      setDrawMode,
      setLineStyle,
      setStraightLineMode,
    ],
  );

  const handleToolChange = (event: SelectChangeEvent) => {
    handleToolSelect(event.target.value as ToolType);
  };

  const drawingToolSelected =
    selectedTool === "pencil" || selectedTool === "line";

  useEffect(() => {
    setStraightLineMode(false);
    setDrawMode(false);
  }, [setDrawMode, setStraightLineMode]);

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

  const toolLabelByValue: Record<ToolType, string> = {
    cursor: "Cursor",
    pencil: "Pencil",
    line: "Line",
    text: "Text",
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
            <Select
              id="tool-select"
              value={selectedTool}
              onChange={handleToolChange}
              sx={{
                height: "30px",
                minWidth: 145,
                mr: 1,
                "& .MuiSelect-select": {
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  gap: 1,
                  whiteSpace: "nowrap",
                },
              }}
              renderValue={(value) => (
                <SoftBox
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {value === "cursor" && <NorthWestIcon fontSize="small" />}
                  {value === "pencil" && <DrawIcon fontSize="small" />}
                  {value === "line" && <HorizontalRuleIcon fontSize="small" />}
                  {value === "text" && <TextFieldsIcon fontSize="small" />}
                  {toolLabelByValue[value as ToolType]}
                </SoftBox>
              )}
            >
              <MenuItem value="cursor">
                <SoftBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NorthWestIcon fontSize="small" /> Cursor
                </SoftBox>
              </MenuItem>
              <MenuItem value="pencil">
                <SoftBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DrawIcon fontSize="small" /> Pencil
                </SoftBox>
              </MenuItem>
              <MenuItem value="line">
                <SoftBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HorizontalRuleIcon fontSize="small" /> Line
                </SoftBox>
              </MenuItem>
              <MenuItem value="text">
                <SoftBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextFieldsIcon fontSize="small" /> Text
                </SoftBox>
              </MenuItem>
            </Select>
            {drawingToolSelected && (
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
                <Tooltip title={t("TacticBoard:topMenu.arrowTip.tooltip")}>
                  <span>
                    <ToggleButton
                      value={arrowTipEnabled}
                      selected={arrowTipEnabled}
                      size="small"
                      onChange={() => {
                        const next = !arrowTipEnabled;
                        setArrowTipEnabledState(next);
                        setArrowTipEnabled(next);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <ArrowRightAltIcon />
                    </ToggleButton>
                  </span>
                </Tooltip>
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

        {isPrivileged && isEditMode && selectedTextbox && (
          <>
            <Tooltip title={t("TacticBoard:topMenu.textColorButton.tooltip")}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleTextColorPickerOpen}
                  sx={{
                    mr: 1,
                    backgroundColor: currentTextColor,
                    width: 30,
                    height: 30,
                    "&:hover": {
                      backgroundColor: currentTextColor,
                    },
                  }}
                >
                  <ColorLensIcon sx={{ color: "#ffffff" }} />
                </IconButton>
              </span>
            </Tooltip>
            <Popover
              open={textColorPickerOpen}
              anchorEl={textColorPickerAnchor}
              onClose={handleTextColorPickerClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <ChromePicker
                color={currentTextColor}
                onChange={handleTextColorChange}
                onChangeComplete={handleTextColorChange}
              />
            </Popover>

            <Tooltip title={t("TacticBoard:topMenu.fontSizeSlider.tooltip")}>
              <Slider
                value={currentFontSize}
                onChange={handleFontSizeChange}
                min={8}
                max={96}
                valueLabelDisplay="auto"
                sx={{ width: 120, ml: 1, mr: 2 }}
              />
            </Tooltip>
          </>
        )}
        {/* TEXT BUTTON END */}

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
