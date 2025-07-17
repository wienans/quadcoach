import "./translations";
import { useState } from "react";
import { Pagination, ToggleButton, ButtonGroup } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import DrawIcon from "@mui/icons-material/Draw";
import EditIcon from "@mui/icons-material/Edit";
import { SoftBox, SoftButton } from "..";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import {
  useTacticBoardCanvas,
  useTacticBoardDrawing,
} from "../../hooks/taticBoard";

export type TacticsBoardToolBarProps = {
  editMode: boolean;
  disabled?: boolean;
  setEditMode: (editMode: boolean) => void;
  setPage: (page: number) => void;
  currentPage: number;
  setMaxPages: (maxPages: number) => void;
  maxPages: number;
  onSave: () => void;
  onDelete: () => void;
  onLoadPage: (page: number, newPage?: boolean, removePage?: boolean) => void;
  handleFullScreen: () => void;
};

const TacticsBoardToolBar = ({
  editMode,
  setEditMode,
  setPage,
  currentPage,
  setMaxPages,
  maxPages,
  disabled,
  onLoadPage,
  onDelete,
  handleFullScreen,
}: TacticsBoardToolBarProps): JSX.Element => {
  const { setSelection } = useTacticBoardCanvas();
  const { setDrawMode } = useTacticBoardDrawing();
  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
  const [drawingEnabled, enableDrawing] = useState<boolean>(false);
  return (
    <SoftBox
      display="flex"
      justifyContent="space-evenly"
      alignContent="center"
      width="100%"
    >
      <ButtonGroup>
        <ToggleButton
          value="edit"
          selected={editMode}
          disabled={disabled}
          onChange={() => {
            setEditMode(!editMode);
            setSelection(!editMode);
            if (!editMode == false) {
              enableDrawing(false);
              setDrawMode(false);
            }
          }}
        >
          <EditIcon fontSize="medium" />
        </ToggleButton>
        <ToggleButton
          value="drawing"
          selected={drawingEnabled}
          disabled={!editMode || disabled}
          onChange={() => {
            setDrawMode(!drawingEnabled);
            enableDrawing(!drawingEnabled);
          }}
        >
          <DrawIcon fontSize="medium" />
        </ToggleButton>
        <SoftButton
          disabled={!editMode || disabled}
          onClick={onDelete}
          iconOnly
          size="large"
        >
          <DeleteIcon fontSize="medium" />
        </SoftButton>
      </ButtonGroup>
      <SoftBox display="flex" alignItems="center" justifyContent="center">
        <SoftButton
          disabled={disabled || maxPages == 1 || currentPage != maxPages}
          onClick={() => {
            if (maxPages > 1) {
              setMaxPages(maxPages - 1);
              setPage(currentPage - 1);
              onLoadPage(currentPage - 1, false, true);
            }
          }}
          iconOnly
          size="large"
        >
          <RemoveIcon />
        </SoftButton>
        <Pagination
          count={maxPages}
          siblingCount={0}
          boundaryCount={0}
          page={currentPage}
          disabled={disabled}
          onChange={handleChange}
        />
        <SoftButton
          disabled={disabled || currentPage != maxPages}
          onClick={() => {
            setMaxPages(maxPages + 1);
            setPage(currentPage + 1);
            onLoadPage(currentPage + 1, true, false);
          }}
          iconOnly
          size="large"
        >
          <AddIcon />
        </SoftButton>
      </SoftBox>
      <SoftBox display="flex" alignItems="center" justifyContent="center">
        <SoftButton iconOnly onClick={handleFullScreen} size="large">
          <FullscreenIcon />
        </SoftButton>
      </SoftBox>
    </SoftBox>
  );
};

export default TacticsBoardToolBar;
